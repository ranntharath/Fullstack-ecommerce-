import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';

interface Specification {
  id: string;
  key: string;
  value: string;
}

interface SpecificationsSectionProps {
  specifications: Specification[];
  addSpecification: () => void;
  updateSpecification: (id: string, field: 'key' | 'value', val: string) => void;
  removeSpecification: (id: string) => void;
}

export default function SpecificationsSection({
  specifications,
  addSpecification,
  updateSpecification,
  removeSpecification
}: SpecificationsSectionProps) {
  return (
    <div className="bg-white p-6 rounded-md shadow-sm border">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Specifications</h2>
          <p className="text-sm text-slate-500">Add technical specifications as key-value pairs (e.g., Weight: 1kg).</p>
        </div>
        <Button type="button" onClick={addSpecification} variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" /> Add Spec
        </Button>
      </div>

      <div className="space-y-3">
        {specifications.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No specifications added yet.</p>
        ) : (
          specifications.map((spec) => (
            <div key={spec.id} className="flex gap-3 items-center">
              <Input
                placeholder="e.g. Storage"
                value={spec.key}
                onChange={(e) => updateSpecification(spec.id, 'key', e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="e.g. 256GB"
                value={spec.value}
                onChange={(e) => updateSpecification(spec.id, 'value', e.target.value)}
                className="flex-1"
              />
              <Button type="button" variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => removeSpecification(spec.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
