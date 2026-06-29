import { useEditor, GeoShapeGeoStyle, useValue } from 'tldraw';
import { 
  MousePointer2, 
  Hand, 
  Pencil, 
  Type, 
  Square, 
  Circle,
  Triangle,
  ArrowRight,
  Eraser,
  Plus,
  Trash2,
  Undo2,
  Redo2,
  Box
} from 'lucide-react';

export function DesignJournalUI() {
  const editor = useEditor();
  const currentTool = useValue('tool', () => editor.getCurrentToolId(), [editor]);
  const pages = useValue('pages', () => editor.getPages(), [editor]);
  const currentPageId = useValue('currentPageId', () => editor.getCurrentPageId(), [editor]);

  const selectTool = (tool: string) => {
    editor.setCurrentTool(tool);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const center = editor.getViewportPageBounds().center;
    
    editor.createShape({
      type: 'threeD',
      x: center.x - 200,
      y: center.y - 200,
      props: {
        w: 400,
        h: 400,
        url: url,
        filename: file.name
      }
    });

    // Reset input
    e.target.value = '';
  };

  const selectShape = (shapeType: 'rectangle' | 'ellipse' | 'triangle') => {
    editor.setStyleForNextShapes(GeoShapeGeoStyle, shapeType);
    editor.setCurrentTool('geo');
  };

  const handleAddPage = () => {
    const pageName = `Page ${pages.length + 1}`;
    editor.createPage({ name: pageName });
    // Navigate to the newly created page (last in list)
    const updatedPages = editor.getPages();
    const newPage = updatedPages[updatedPages.length - 1];
    if (newPage) {
      editor.setCurrentPage(newPage.id);
    }
  };

  const handleDeletePage = (pageId: string) => {
    if (pages.length <= 1) return;
    editor.deletePage(pageId as any);
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-[999]">
      {/* Floating Undo/Redo (Top Right) */}
      <div className="pointer-events-auto absolute right-4 top-4 flex gap-1 p-1.5 bg-white rounded-xl shadow-medium border border-charcoal-100">
        <button 
          className="h-9 w-9 rounded-lg flex items-center justify-center text-charcoal-400 hover:text-charcoal-900 hover:bg-charcoal-50 transition-colors disabled:opacity-30" 
          onClick={() => editor.undo()} 
          disabled={!editor.getCanUndo()}
        >
          <Undo2 size={16} />
        </button>
        <button 
          className="h-9 w-9 rounded-lg flex items-center justify-center text-charcoal-400 hover:text-charcoal-900 hover:bg-charcoal-50 transition-colors disabled:opacity-30" 
          onClick={() => editor.redo()} 
          disabled={!editor.getCanRedo()}
        >
          <Redo2 size={16} />
        </button>
      </div>

      {/* Left Sidebar (Top Left) */}
      <div className="pointer-events-auto absolute left-4 top-4 flex flex-col gap-1.5 p-2 bg-white rounded-xl shadow-medium border border-charcoal-100 h-fit">
          <ToolButton icon={<MousePointer2 size={18} />} isActive={currentTool === 'select'} onClick={() => selectTool('select')} title="Select" />
          <ToolButton icon={<Hand size={18} />} isActive={currentTool === 'hand'} onClick={() => selectTool('hand')} title="Hand" />
          <ToolButton icon={<Pencil size={18} />} isActive={currentTool === 'draw'} onClick={() => selectTool('draw')} title="Draw" />
          <ToolButton icon={<Type size={18} />} isActive={currentTool === 'text'} onClick={() => selectTool('text')} title="Text" />
          
          <div className="w-full h-px bg-charcoal-100 my-1" />
          
          <ToolButton icon={<Square size={18} />} isActive={currentTool === 'geo' && editor.getSharedStyles().getAsKnownValue(GeoShapeGeoStyle) === 'rectangle'} onClick={() => selectShape('rectangle')} title="Rectangle" />
          <ToolButton icon={<Circle size={18} />} isActive={currentTool === 'geo' && editor.getSharedStyles().getAsKnownValue(GeoShapeGeoStyle) === 'ellipse'} onClick={() => selectShape('ellipse')} title="Circle" />
          <ToolButton icon={<Triangle size={18} />} isActive={currentTool === 'geo' && editor.getSharedStyles().getAsKnownValue(GeoShapeGeoStyle) === 'triangle'} onClick={() => selectShape('triangle')} title="Triangle" />
          <ToolButton icon={<ArrowRight size={18} />} isActive={currentTool === 'arrow'} onClick={() => selectTool('arrow')} title="Arrow" />
          
          <div className="w-full h-px bg-charcoal-100 my-1" />
          
          <ToolButton icon={<Eraser size={18} />} isActive={currentTool === 'eraser'} onClick={() => selectTool('eraser')} title="Eraser" />
          
          <div className="w-full h-px bg-charcoal-100 my-1" />
          
          <label 
            title="Upload 3D Model (.stl)"
            className="p-2.5 rounded-lg transition-all text-charcoal-500 hover:bg-charcoal-50 hover:text-charcoal-900 cursor-pointer flex items-center justify-center"
          >
            <Box size={18} />
            <input 
              type="file" 
              accept=".stl,.obj,.gltf,.glb" 
              className="hidden" 
              onChange={handleFileUpload}
            />
          </label>
        </div>

      {/* Bottom Pages Bar */}
      <div className="pointer-events-auto absolute bottom-4 left-4 right-4 flex items-center gap-2 p-3 bg-white rounded-xl shadow-medium border border-charcoal-100 overflow-x-auto no-scrollbar">
        {pages.map((page) => (
          <div 
            key={page.id}
            onClick={() => editor.setCurrentPage(page.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all min-w-max font-sans text-label-md ${
              currentPageId === page.id 
                ? 'bg-charcoal-900 text-white shadow-sm' 
                : 'bg-charcoal-50 hover:bg-charcoal-100 text-charcoal-600 border border-charcoal-100'
            }`}
          >
            <span className="font-medium">{page.name}</span>
            {pages.length > 1 && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeletePage(page.id);
                }}
                className={`p-0.5 rounded opacity-60 hover:opacity-100 ${currentPageId === page.id ? 'hover:bg-white/20' : 'hover:bg-red-500/10 hover:text-red-500'}`}
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        ))}
        
        <button 
          onClick={handleAddPage}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-charcoal-500 hover:bg-charcoal-50 transition-colors font-sans text-label-md font-medium min-w-max border border-dashed border-charcoal-200"
        >
          <Plus size={14} /> Add Page
        </button>
      </div>
    </div>
  );
}

function ToolButton({ icon, isActive, onClick, title }: { icon: React.ReactNode, isActive: boolean, onClick: () => void, title: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-2.5 rounded-lg transition-all ${
        isActive 
          ? 'bg-charcoal-900 text-white shadow-sm' 
          : 'text-charcoal-500 hover:bg-charcoal-50 hover:text-charcoal-900'
      }`}
    >
      {icon}
    </button>
  );
}
