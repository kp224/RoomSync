"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PlusCircle, Users, Copy, Check } from "lucide-react";
import {
  addTodoItem,
  createTodoList,
  getTodoLists,
  joinTodoList,
  toggleTodoItemCompletion,
} from "@/server/actions/todoActions";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

interface Member {
  email: string;
}

interface TodoList {
  id: string;
  name: string;
  shortId: string;
  createdBy: string;
  todos: Todo[];
  members: Member[];
}

export default function DashboardPage() {
  const [lists, setLists] = useState<TodoList[]>([]);
  useEffect(() => {
    getTodoLists().then((lists) => {
      setLists(lists as TodoList[]);
    });
  }, []);

  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCreateList = async (formData: FormData) => {
    await createTodoList(formData);
    startTransition(() => {
      router.refresh();
    });
  };

  const handleAddTodoItem = async (formData: FormData) => {
    const listId = formData.get("listId") as string;
    const todoItem = formData.get("todoItem") as string;
    await addTodoItem(listId, todoItem);
    startTransition(() => {
      router.refresh();
    });
  };

  const handleJoinList = async (formData: FormData) => {
    const shortId = formData.get("shortId") as string;
    await joinTodoList(shortId);
    startTransition(() => {
      router.refresh();
    });
  };

  const handleToggleTodoCompletion = async (itemId: string) => {
    await toggleTodoItemCompletion(itemId);
    startTransition(() => {
      router.refresh();
    });
  };

  const handleCopyShortId = (shortId: string) => {
    navigator.clipboard.writeText(shortId).then(() => {
      setCopiedId(shortId);
      setTimeout(() => setCopiedId(null), 2000); // Reset after 2 seconds
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Your Todo Lists</h1>

        <div className="flex flex-wrap gap-4">
          <form action={handleCreateList} className="min-w-[200px] flex-1">
            <div className="flex space-x-2">
              <Input
                name="name"
                placeholder="New list name"
                className="flex-grow"
                required
              />
              <Button type="submit" disabled={isPending}>
                <PlusCircle className="mr-2 h-4 w-4" />
                {isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>

          <form action={handleJoinList} className="min-w-[200px] flex-1">
            <div className="flex space-x-2">
              <Input
                name="shortId"
                placeholder="List short ID"
                className="flex-grow"
                required
              />
              <Button type="submit" disabled={isPending}>
                <Users className="mr-2 h-4 w-4" />
                Join
              </Button>
            </div>
          </form>
        </div>
      </div>

      {lists.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {lists.map((list) => (
            <Card
              key={list.id}
              className="shadow-md transition-shadow duration-300 hover:shadow-lg"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold text-blue-600">
                    {list.name}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {list.shortId}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyShortId(list.shortId)}
                    >
                      {copiedId === list.shortId ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="mr-1 h-4 w-4" />
                  {list.members.length} unique member
                  {list.members.length !== 1 ? "s" : ""}
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h4 className="mb-2 text-sm font-semibold text-gray-600">
                    Members:
                  </h4>
                  <ul className="max-h-24 overflow-y-auto text-sm text-gray-500">
                    {list.members.map((member, index) => (
                      <li key={index}>{member.email}</li>
                    ))}
                  </ul>
                </div>
                <ul className="space-y-2">
                  {list.todos.map((todo) => (
                    <li key={todo.id} className="flex items-center space-x-2">
                      <Checkbox
                        checked={todo.completed}
                        onCheckedChange={() =>
                          handleToggleTodoCompletion(todo.id)
                        }
                      />
                      <span className={todo.completed ? "line-through" : ""}>
                        {todo.title}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <form
                  className="flex w-full items-center space-x-2"
                  action={handleAddTodoItem}
                >
                  <input type="hidden" name="listId" value={list.id} />
                  <Input
                    type="text"
                    placeholder="Add a new todo item"
                    className="flex-grow"
                    name="todoItem"
                    required
                  />
                  <Button type="submit" size="sm">
                    Add
                  </Button>
                </form>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">
          You don't have any todo lists yet. Create or join one to get started!
        </p>
      )}
    </div>
  );
}
