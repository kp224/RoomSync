"use server";

import { db } from "@/server/db";
import { todoLists, todos, todoListMembers } from "@/server/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { users } from "@/server/db/schema"; // Make sure to import the users table

export async function createTodoList(formData: FormData) {
  const { userId } = auth();
  if (!userId) throw new Error("User not authenticated");

  const name = formData.get("name") as string;
  if (!name) throw new Error("List name is required");

  const shortId = nanoid(10);
  const [newList] = await db
    .insert(todoLists)
    .values({
      name,
      shortId,
      createdBy: userId,
    })
    .returning();

  await db.insert(todoListMembers).values({
    todoListId: newList!.id,
    userId,
  });

  revalidatePath("/dashboard");
  return newList;
}

export async function getTodoLists() {
  const { userId } = auth();
  if (!userId) throw new Error("User not authenticated");

  const lists = await db
    .select({
      id: todoLists.id,
      name: todoLists.name,
      shortId: todoLists.shortId,
      createdBy: todoLists.createdBy,
      todos: sql`json_agg(json_build_object(
        'id', ${todos.id},
        'title', ${todos.title},
        'completed', ${todos.completed}
      ) ORDER BY ${todos.createdAt} DESC)`,
      members: sql`json_agg(json_build_object(
        'id', ${users.id},
        'email', ${users.email}
      ))`,
    })
    .from(todoListMembers)
    .innerJoin(todoLists, eq(todoListMembers.todoListId, todoLists.id))
    .leftJoin(todos, eq(todos.todoListId, todoLists.id))
    .innerJoin(users, eq(todoListMembers.userId, users.id))
    .where(eq(todoListMembers.userId, userId))
    .groupBy(todoLists.id);

  interface Todo {
    id: string | null;
    title: string;
    completed: boolean;
  }

  interface Member {
    id: string;
    email: string;
  }

  return lists.map((list) => ({
    ...list,
    todos: (list.todos as Todo[]).filter((todo) => todo.id !== null),
    members: list.members as Member[],
  }));
}

export async function getTodoItems(listId: string) {
  const { userId } = auth();
  if (!userId) throw new Error("User not authenticated");

  const items = await db
    .select()
    .from(todos)
    .where(eq(todos.todoListId, listId));
  return items;
}

export async function addTodoItem(listId: string, item: string) {
  const { userId } = auth();
  if (!userId) throw new Error("User not authenticated");

  const [newItem] = await db.insert(todos).values({
    todoListId: listId,
    title: item,
    createdBy: userId,
  });

  return newItem;
}

export async function joinTodoList(shortId: string) {
  const { userId } = auth();
  if (!userId) throw new Error("User not authenticated");

  const [list] = await db
    .select()
    .from(todoLists)
    .where(eq(todoLists.shortId, shortId));
  if (!list) throw new Error("List not found");

  await db.insert(todoListMembers).values({
    todoListId: list.id,
    userId,
  });

  revalidatePath("/dashboard");
  return list;
}

export async function completeTodoItem(itemId: string) {
  const { userId } = auth();
  if (!userId) throw new Error("User not authenticated");

  const [item] = await db
    .update(todos)
    .set({ completed: true })
    .where(eq(todos.id, itemId));
  return item;
}

export async function toggleTodoItemCompletion(itemId: string) {
  const { userId } = auth();
  if (!userId) throw new Error("User not authenticated");

  const [existingItem] = await db
    .select({ completed: todos.completed })
    .from(todos)
    .where(eq(todos.id, itemId));

  if (!existingItem) throw new Error("Todo item not found");

  const [updatedItem] = await db
    .update(todos)
    .set({ completed: !existingItem.completed })
    .where(eq(todos.id, itemId))
    .returning();

  revalidatePath("/dashboard");
  return updatedItem;
}
