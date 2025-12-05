"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface Task {
  id: string;
  title: string;
  application_id: string;
  due_at: string;
  status: string;
}

interface TasksTableProps {
  tasks: Task[];
  onComplete: (id: string) => void;
}

export function TasksTable({ tasks, onComplete }: TasksTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Application ID</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {tasks.map((task) => (
          <TableRow key={task.id}>
            <TableCell>{task.title}</TableCell>
            <TableCell>{task.application_id}</TableCell>
            <TableCell>{new Date(task.due_at).toLocaleString()}</TableCell>
            <TableCell>{task.status}</TableCell>
            <TableCell>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onComplete(task.id)}
              >
                Mark Complete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
