'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, GripVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { tasksApi } from '@/lib/api';

interface Task {
  id: string;
  projectId: string;
  title: string;
  status: string; // 'todo', 'in_progress', 'done'
  order: number;
}

const COLUMNS = [
  { id: 'todo', title: 'To Do' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
];

function SortableTask({ task, onDelete }: { task: Task; onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3.5 bg-white border border-charcoal-100 rounded-xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] group hover:border-charcoal-200 hover:shadow-sm transition-all"
    >
      <div {...attributes} {...listeners} className="cursor-grab text-charcoal-300 hover:text-charcoal-900 transition-colors">
        <GripVertical className="h-4 w-4" />
      </div>
      <div className="flex-1 text-sm font-sans font-medium text-charcoal-900">{task.title}</div>
      <button
        onClick={() => onDelete(task.id)}
        className="text-charcoal-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function DroppableColumn({ id, title, tasks, onDelete, onAdd }: { id: string, title: string, tasks: Task[], onDelete: (id: string) => void, onAdd: (title: string) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleAdd = () => {
    if (!newTaskTitle.trim()) return;
    onAdd(newTaskTitle);
    setNewTaskTitle('');
  };

  return (
    <div 
      ref={setNodeRef} 
      className={`flex-shrink-0 w-[320px] bg-charcoal-50 rounded-2xl flex flex-col border transition-colors duration-200 ${isOver ? 'border-accent shadow-sm' : 'border-transparent'}`}
    >
      <div className="p-4 font-heading font-bold text-charcoal-900 flex items-center justify-between border-b border-charcoal-100/50">
        <div className="flex items-center gap-2">
          {title}
          <span className="text-xs text-charcoal-500 bg-white px-2.5 py-1 rounded-full border border-charcoal-100 font-sans shadow-sm">
            {tasks.length}
          </span>
        </div>
      </div>
      
      <div className="flex-1 p-3 flex flex-col gap-3 min-h-[200px]">
        <SortableContext
          items={tasks.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <SortableTask key={task.id} task={task} onDelete={onDelete} />
          ))}
        </SortableContext>
      </div>
      
      {id === 'todo' && (
        <div className="p-3 pt-0">
          <div className="flex gap-2">
            <Input
              placeholder="Add a new task..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              className="h-9 text-sm bg-white border-charcoal-100 focus-visible:ring-charcoal-300 rounded-xl"
            />
            <Button size="sm" className="h-9 px-3 rounded-xl bg-charcoal-900 text-white hover:bg-charcoal-800" onClick={handleAdd}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function TaskBoard({ projectId }: { projectId: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const fetchTasks = async () => {
    try {
      const data = await tasksApi.listByProject(projectId);
      setTasks(data.sort((a, b) => a.order - b.order));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTask = async (columnId: string, title: string) => {
    try {
      const task = await tasksApi.create(projectId, {
        title,
        status: columnId,
      });
      setTasks([...tasks, task]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await tasksApi.delete(id);
      setTasks(tasks.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event: any) => {
    setActiveId(null);
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;
    const isOverColumn = COLUMNS.some(c => c.id === overId);

    const activeTask = tasks.find(t => t.id === activeId);
    if (!activeTask) return;

    let newStatus = activeTask.status;
    // Create new objects so we don't mutate the original activeTask in place
    let newTasks = tasks.map(t => ({ ...t }));
    let newOrder = activeTask.order;

    // Dropped over an empty column
    if (isOverColumn) {
      if (activeTask.status !== overId) {
        newStatus = overId;
        const taskIndex = newTasks.findIndex(t => t.id === activeId);
        newTasks[taskIndex].status = newStatus;
        
        const columnTasks = newTasks.filter(t => t.status === newStatus);
        const lastTask = columnTasks.sort((a, b) => a.order - b.order).pop();
        newOrder = lastTask ? lastTask.order + 1000 : 1000;
        
        newTasks[taskIndex].order = newOrder;
        setTasks(newTasks);
      }
    } 
    // Dropped over another task
    else {
      const overTask = tasks.find(t => t.id === overId);
      if (overTask) {
        newStatus = overTask.status;
        
        const oldIndex = newTasks.findIndex(t => t.id === activeId);
        const newIndex = newTasks.findIndex(t => t.id === overId);
        
        newTasks[oldIndex].status = newStatus;
        newTasks = arrayMove(newTasks, oldIndex, newIndex);
        
        // Find the new exact order
        const columnTasks = newTasks.filter(t => t.status === newStatus);
        const currentIndexInColumn = columnTasks.findIndex(t => t.id === activeId);
        
        const prevTask = columnTasks[currentIndexInColumn - 1];
        const nextTask = columnTasks[currentIndexInColumn + 1];
        
        if (!prevTask && !nextTask) {
           newOrder = 1000;
        } else if (!prevTask) {
           newOrder = nextTask.order - 1000;
        } else if (!nextTask) {
           newOrder = prevTask.order + 1000;
        } else {
           newOrder = (prevTask.order + nextTask.order) / 2;
        }
        
        newTasks.find(t => t.id === activeId)!.order = newOrder;
        setTasks(newTasks);
      }
    }

    // Persist to backend if there was a change
    if (newStatus !== activeTask.status || newOrder !== activeTask.order) {
      try {
        await tasksApi.update(activeId, { status: newStatus, order: newOrder });
      } catch (err) {
        console.error('Failed to save task move', err);
      }
    }
  };

  return (
    <div className="flex gap-6 h-full overflow-x-auto pb-4 pt-2 px-2 no-scrollbar">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {COLUMNS.map((column) => (
          <DroppableColumn 
            key={column.id} 
            id={column.id} 
            title={column.title} 
            tasks={tasks.filter(t => t.status === column.id).sort((a, b) => a.order - b.order)} 
            onDelete={handleDeleteTask}
            onAdd={(title) => handleAddTask(column.id, title)}
          />
        ))}

        <DragOverlay>
          {activeId ? (
            <div className="flex items-center gap-3 p-3.5 bg-white border border-accent rounded-xl shadow-lg opacity-90 scale-105 transition-transform">
              <GripVertical className="h-4 w-4 text-accent" />
              <div className="flex-1 text-sm font-sans font-medium text-charcoal-900">
                {tasks.find((t) => t.id === activeId)?.title}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
