import { useEffect, useState } from 'react'
import { useStore } from '../../store'
import { ChevronRight, ChevronDown, GripVertical } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface SortableItemProps {
  id: string
  category: any
  onEdit: (c: any) => void
  onDelete: (id: string) => void
  onAddSub: (id: string) => void
}

function SortableCategoryItem({ id, category: c, onEdit, onDelete, onAddSub }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <li 
      ref={setNodeRef} 
      style={style} 
      className={`p-6 flex items-center justify-between transition-colors bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 last:border-0 ${isDragging ? 'shadow-lg relative' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}
    >
      <div className="flex items-center flex-1" style={{ paddingLeft: `${(c.level - 1) * 2}rem` }}>
        <button 
          className="mr-3 p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-grab active:cursor-grabbing rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          {...attributes} 
          {...listeners}
        >
          <GripVertical className="w-5 h-5" />
        </button>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-zinc-500 font-bold mr-4 shrink-0 ${c.level === 1 ? 'bg-zinc-100 dark:bg-zinc-800 text-lg' : c.level === 2 ? 'bg-zinc-50 dark:bg-zinc-800/50 text-base' : 'bg-transparent text-sm'}`}>
          {c.level === 3 ? '↳' : c.name.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              {c.level}级
            </span>
            <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">{c.name}</h3>
          </div>
          <p className="text-sm text-zinc-500 mt-1">ID: {c.id}</p>
        </div>
      </div>
      <div className="flex space-x-3 shrink-0 ml-4">
        {c.level < 3 && (
          <button onClick={() => onAddSub(c.id)} className="text-green-600 hover:text-green-800 text-sm font-medium px-3 py-1.5 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">添加子栏目</button>
        )}
        <button onClick={() => onEdit(c)} className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">编辑</button>
        <button onClick={() => onDelete(c.id)} className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">删除</button>
      </div>
    </li>
  )
}

export default function Categories() {
  const { token, profileKey } = useStore()
  const [categories, setCategories] = useState<any[]>([])
  const [editing, setEditing] = useState<any>(null)
  
  const qp = `?profileKey=${encodeURIComponent(profileKey)}`
  const fetchCategories = () => fetch(`/api/categories${qp}`).then(r => r.json()).then(setCategories)
  
  useEffect(() => { fetchCategories() }, [profileKey])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const method = editing.id ? 'PUT' : 'POST'
    const url = editing.id ? `/api/categories/${editing.id}${qp}` : `/api/categories${qp}`
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        name: editing.name,
        parentId: editing.parentId || null
      })
    })
    setEditing(null)
    fetchCategories()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确认删除？如果包含子栏目，请先删除子栏目。')) return
    await fetch(`/api/categories/${id}${qp}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    fetchCategories()
  }

  const buildTree = (cats: any[]) => {
    const tree: any[] = []
    const map: any = {}
    cats.forEach(c => map[c.id] = { ...c, children: [] })
    cats.forEach(c => {
      if (c.parentId && map[c.parentId]) {
        map[c.parentId].children.push(map[c.id])
      } else {
        tree.push(map[c.id])
      }
    })
    return tree
  }

  const flattenTree = (tree: any[], level = 1): any[] => {
    let result: any[] = []
    tree.forEach(node => {
      result.push({ ...node, level })
      if (node.children && node.children.length > 0) {
        result = result.concat(flattenTree(node.children, level + 1))
      }
    })
    return result
  }

  const tree = buildTree(categories)
  const flatCategories = flattenTree(tree)

  // Sort flatCategories by sortOrder for rendering
  // We don't want to break the tree structure, but siblings should be ordered by sortOrder
  // Actually, the buildTree doesn't sort, we should sort children when building
  
  // Let's modify buildTree to sort by sortOrder
  const buildSortedTree = (cats: any[]) => {
    const tree: any[] = []
    const map: any = {}
    cats.forEach(c => map[c.id] = { ...c, children: [] })
    cats.forEach(c => {
      if (c.parentId && map[c.parentId]) {
        map[c.parentId].children.push(map[c.id])
      } else {
        tree.push(map[c.id])
      }
    })
    
    const sortNode = (node: any) => {
      if (node.children) {
        node.children.sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0))
        node.children.forEach(sortNode)
      }
    }
    
    tree.sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0))
    tree.forEach(sortNode)
    
    return tree
  }

  const sortedTree = buildSortedTree(categories)
  const sortedFlatCategories = flattenTree(sortedTree)

  // Options for parentId select (only level 1 and 2 can be parents)
  const parentOptions = sortedFlatCategories.filter(c => c.level < 3 && c.id !== editing?.id)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over || active.id === over.id) return

    // Find indices in the flat array
    const oldIndex = sortedFlatCategories.findIndex(c => c.id === active.id)
    const newIndex = sortedFlatCategories.findIndex(c => c.id === over.id)
    
    if (oldIndex === -1 || newIndex === -1) return

    const activeItem = sortedFlatCategories[oldIndex]
    const overItem = sortedFlatCategories[newIndex]

    // Only allow sorting within the same parent level to prevent hierarchy breaking
    if (activeItem.parentId !== overItem.parentId) {
      alert('只能在同级栏目之间进行拖拽排序')
      return
    }

    // Get all siblings
    const siblings = sortedFlatCategories.filter(c => c.parentId === activeItem.parentId)
    const activeSiblingIndex = siblings.findIndex(c => c.id === active.id)
    const overSiblingIndex = siblings.findIndex(c => c.id === over.id)

    // Reorder siblings
    const newSiblings = arrayMove(siblings, activeSiblingIndex, overSiblingIndex)
    
    // Update sortOrder locally
    const updates = newSiblings.map((c, index) => ({
      id: c.id,
      sortOrder: index
    }))

    // Optimistically update local state
    setCategories(prev => prev.map(c => {
      const update = updates.find(u => u.id === c.id)
      return update ? { ...c, sortOrder: update.sortOrder } : c
    }))

    // Save to backend
    try {
      await fetch(`/api/categories/reorder${qp}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ items: updates })
      })
    } catch (e) {
      console.error('Failed to reorder', e)
      fetchCategories() // Revert on failure
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">栏目管理</h1>
        <button onClick={() => setEditing({ name: '', parentId: '' })} className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">
          添加栏目
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 shadow-sm rounded-2xl border border-zinc-100 dark:border-zinc-800">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sortedFlatCategories.map(c => c.id)} strategy={verticalListSortingStrategy}>
            <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {sortedFlatCategories.map(c => (
                <SortableCategoryItem 
                  key={c.id} 
                  id={c.id} 
                  category={c} 
                  onEdit={(c) => setEditing(c)} 
                  onDelete={handleDelete} 
                  onAddSub={(parentId) => setEditing({ name: '', parentId })} 
                />
              ))}
              {sortedFlatCategories.length === 0 && (
                <li className="p-8 text-center text-zinc-500">暂无栏目数据</li>
              )}
            </ul>
          </SortableContext>
        </DndContext>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSave} className="bg-white dark:bg-zinc-900 p-8 rounded-2xl w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-6 text-zinc-900 dark:text-white">{editing.id ? '编辑栏目' : '添加栏目'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">上级栏目</label>
                <select value={editing.parentId || ''} onChange={e => setEditing({...editing, parentId: e.target.value})} className="mt-1 block w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 p-2.5 outline-none focus:ring-2 focus:ring-zinc-500">
                  <option value="">-- 作为一级栏目 --</option>
                  {parentOptions.map(p => (
                    <option key={p.id} value={p.id}>
                      {'\u00A0'.repeat((p.level - 1) * 4)}{p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">栏目名称</label>
                <input required type="text" value={editing.name} onChange={e => setEditing({...editing, name: e.target.value})} className="mt-1 block w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 p-2.5 outline-none focus:ring-2 focus:ring-zinc-500" />
              </div>
            </div>
            <div className="mt-8 flex justify-end space-x-3">
              <button type="button" onClick={() => setEditing(null)} className="px-5 py-2.5 text-zinc-600 hover:bg-zinc-100 rounded-2xl transition-colors font-medium">取消</button>
              <button type="submit" className="px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl transition-colors font-medium">保存</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
