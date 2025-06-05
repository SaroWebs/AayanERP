import { Modal, Button, Text, Stack, Textarea, Group } from '@mantine/core';
import { router } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, XCircle, Send, FileText } from 'lucide-react';
import { EnquiryAction } from './types';

interface Enquiry {
    id: number;
    enquiry_no: string;
    status: string;
    approval_status: string;
}

type ModalAction = EnquiryAction;

interface Props {
    opened: boolean;
    onClose: () => void;
    enquiry: Enquiry | null;
    action: ModalAction | null;
}

export function EnquiryActionModal({ enquiry, action, opened, onClose }: Props) {
    if (!enquiry || !action) return null;

    const handleAction = (remarks?: string) => {
        if (action === 'view' || action === 'edit' || action === 'create') {
            router.visit(route(`sales.enquiries.${action}`, enquiry.id));
            return;
        }

        const routeMap: Record<Exclude<typeof action, 'view' | 'edit' | 'create' | null>, string> = {
            submit: 'sales.enquiries.submit',
            approve: 'sales.enquiries.approve',
            reject: 'sales.enquiries.reject',
            convert: 'sales.enquiries.convert',
            cancel: 'sales.enquiries.cancel',
        };

        if (!action) return;
        router.post(route(routeMap[action], enquiry.id), {
            remarks,
        }, {
            onSuccess: () => onClose(),
        });
    };

    const getModalContent = () => {
        if (!action || action === 'view' || action === 'edit') return null;

        switch (action) {
            case 'submit':
                return {
                    title: 'Submit for Review',
                    icon: <Send size={24} />,
                    color: 'blue',
                    message: 'Are you sure you want to submit this enquiry for review?',
                    actionLabel: 'Submit',
                } as const;
            case 'approve':
                return {
                    title: 'Approve Enquiry',
                    icon: <CheckCircle2 size={24} />,
                    color: 'green',
                    message: 'Are you sure you want to approve this enquiry?',
                    actionLabel: 'Approve',
                } as const;
            case 'reject':
                return {
                    title: 'Reject Enquiry',
                    icon: <XCircle size={24} />,
                    color: 'red',
                    message: 'Are you sure you want to reject this enquiry?',
                    actionLabel: 'Reject',
                    requireRemarks: true,
                } as const;
            case 'convert':
                return {
                    title: 'Convert to Quotation',
                    icon: <FileText size={24} />,
                    color: 'blue',
                    message: 'Are you sure you want to convert this enquiry to a quotation?',
                    actionLabel: 'Convert',
                } as const;
            case 'cancel':
                return {
                    title: 'Cancel Enquiry',
                    icon: <AlertCircle size={24} />,
                    color: 'red',
                    message: 'Are you sure you want to cancel this enquiry?',
                    actionLabel: 'Cancel',
                    requireRemarks: true,
                } as const;
        }
    };

    const content = getModalContent();
    if (!content) return null;

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={
                <Group gap="xs">
                    {content.icon}
                    <Text fw={500}>{content.title}</Text>
                </Group>
            }
            size="md"
        >
            <Stack>
                <Text>{content.message}</Text>
                
                {content.requireRemarks && (
                    <Textarea
                        label="Remarks"
                        placeholder="Enter remarks..."
                        minRows={3}
                        required
                    />
                )}

                <Group justify="flex-end" mt="md">
                    <Button variant="light" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        color={content.color}
                        onClick={() => handleAction()}
                    >
                        {content.actionLabel}
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
} 