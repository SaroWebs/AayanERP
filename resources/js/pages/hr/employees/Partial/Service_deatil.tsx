import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { useForm } from '@inertiajs/react';

interface ServiceDetail {
    id: number;
    service_type: string;
    service_start_date: string;
    service_end_date: string | null;
    service_status: 'active' | 'completed' | 'terminated';
    service_location: string;
    service_description: string | null;
}

interface Props {
    employeeId: number;
    serviceDetail: ServiceDetail;
    onUpdate: () => void;
}

const ServiceDetail = ({ employeeId, serviceDetail, onUpdate }: Props) => {
    const [open, setOpen] = useState(false);
    const { data, setData, put, processing, errors, reset } = useForm({
        service_type: serviceDetail.service_type,
        service_start_date: serviceDetail.service_start_date,
        service_end_date: serviceDetail.service_end_date || '',
        service_status: serviceDetail.service_status,
        service_location: serviceDetail.service_location,
        service_description: serviceDetail.service_description || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/hr/employees/${employeeId}/service-details/${serviceDetail.id}`, {
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
                    Edit Service Details
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Service Details</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="service_type">Service Type</Label>
                        <Input
                            id="service_type"
                            value={data.service_type}
                            onChange={e => setData('service_type', e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="service_start_date">Service Start Date</Label>
                        <Input
                            id="service_start_date"
                            type="date"
                            value={data.service_start_date}
                            onChange={e => setData('service_start_date', e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="service_end_date">Service End Date</Label>
                        <Input
                            id="service_end_date"
                            type="date"
                            value={data.service_end_date}
                            onChange={e => setData('service_end_date', e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="service_status">Service Status</Label>
                        <select
                            id="service_status"
                            value={data.service_status}
                            onChange={e => setData('service_status', e.target.value as 'active' | 'completed' | 'terminated')}
                            required
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="terminated">Terminated</option>
                        </select>
                    </div>
                    <div>
                        <Label htmlFor="service_location">Service Location</Label>
                        <Input
                            id="service_location"
                            value={data.service_location}
                            onChange={e => setData('service_location', e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="service_description">Service Description</Label>
                        <Textarea
                            id="service_description"
                            value={data.service_description}
                            onChange={e => setData('service_description', e.target.value)}
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

export default ServiceDetail;
