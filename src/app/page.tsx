import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { SignedIn, SignedOut, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-100 to-white">
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            Welcome to <span className="text-blue-600">RoomSync</span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-base text-gray-500 sm:text-lg md:mt-5 md:max-w-3xl md:text-xl">
            Collaborate on tasks effortlessly. Create, share, and manage todo
            lists with anyone, anywhere.
          </p>
          <div className="mx-auto mt-5 max-w-md sm:flex sm:justify-center md:mt-8">
            <SignedOut>
              <div className="rounded-md shadow">
                <SignUpButton mode="modal">
                  <Button className="w-full sm:w-auto">
                    Create a Todo List
                  </Button>
                </SignUpButton>
              </div>
              <div className="mt-3 rounded-md shadow sm:ml-3 sm:mt-0">
                <SignUpButton mode="modal">
                  <Button variant="outline" className="w-full sm:w-auto">
                    Join a Todo List
                  </Button>
                </SignUpButton>
              </div>
            </SignedOut>
            <SignedIn>
              <div className="rounded-md shadow">
                <Link href="/dashboard">
                  <Button className="w-full sm:w-auto">Go to Dashboard</Button>
                </Link>
              </div>
            </SignedIn>
          </div>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Create</CardTitle>
              <CardDescription>
                Start a new todo list for your project or team.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Easily create and organize tasks in a collaborative environment.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Share</CardTitle>
              <CardDescription>
                Invite others to join your todo list with a simple code.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Collaborate in real-time with team members or friends.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sync</CardTitle>
              <CardDescription>
                Stay updated with real-time synchronization across devices.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Access your todos from anywhere, on any device.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
