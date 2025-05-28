import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState } from 'react';
import { useForm } from '@inertiajs/react';

interface QualificationDetail {
    id: number;
    employee_id: number;
    qualification_type: string;
    institution: string;
    year_of_passing: string;
    marks_percentage: string;
    grade: string;
    specialization: string | null;
    board: string | null;
    created_at?: string;
    updated_at?: string;
}

interface Props {
    employeeId: number;
    qualification: QualificationDetail;
    onUpdate: () => void;
}

const QualificationDetail = ({ employeeId, qualification, onUpdate }: Props) => {
    const [open, setOpen] = useState(false);
    const { data, setData, put, processing, errors, reset } = useForm({
        qualification_type: qualification.qualification_type,
        institution: qualification.institution,
        year_of_passing: qualification.year_of_passing,
        marks_percentage: qualification.marks_percentage,
        grade: qualification.grade,
        specialization: qualification.specialization || '',
        board: qualification.board || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/hr/employees/${employeeId}/qualifications/${qualification.id}`, {
            onSuccess: () => {
                setOpen(false);
                reset();
                onUpdate();
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    Edit Qualification
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Qualification</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="qualification_type">Qualification Type</Label>
                        <Input
                            id="qualification_type"
                            value={data.qualification_type}
                            onChange={e => setData('qualification_type', e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="institution">Institution</Label>
                        <Input
                            id="institution"
                            value={data.institution}
                            onChange={e => setData('institution', e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="year_of_passing">Year of Passing</Label>
                        <Input
                            id="year_of_passing"
                            type="number"
                            value={data.year_of_passing}
                            onChange={e => setData('year_of_passing', e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="marks_percentage">Marks/Percentage</Label>
                        <Input
                            id="marks_percentage"
                            type="number"
                            value={data.marks_percentage}
                            onChange={e => setData('marks_percentage', e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="grade">Grade</Label>
                        <Input
                            id="grade"
                            value={data.grade}
                            onChange={e => setData('grade', e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="specialization">Specialization</Label>
                        <Input
                            id="specialization"
                            value={data.specialization}
                            onChange={e => setData('specialization', e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="board">Board</Label>
                        <Input
                            id="board"
                            value={data.board}
                            onChange={e => setData('board', e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end space-x-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default QualificationDetail;
