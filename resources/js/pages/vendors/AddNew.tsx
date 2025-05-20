import React, { useState } from 'react'
import { useDisclosure } from '@mantine/hooks';
import { Modal, Button, Tabs, Textarea, TextInput, Select, FileInput, Group, ActionIcon, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { PlusIcon, TrashIcon } from 'lucide-react';

interface BankAccount {
    account_holder_name: string;
    account_number: string;
    bank_name: string;
    ifsc: string;
    branch_address: string;
}

interface ContactDetail {
    contact_person: string;
    department: string;
    designation: string;
    phone: string;
    email: string;
}

interface Document {
    document_type: string;
    document_name: string;
    document_number: string;
    remarks: string;
    sharing_option: 'public' | 'private';
    file: File | null;
}

interface VendorForm {
    name: string;
    contact_no: string;
    email: string;
    gstin: string;
    pan_no: string;
    fax: string;
    state: string;
    address: string;
    bank_accounts: BankAccount[];
    contact_details: ContactDetail[];
    documents: Document[];
}

const AddNew = () => {
    const [opened, { open, close }] = useDisclosure(false);
    const [activeTab, setActiveTab] = useState<string | null>('basic_profile');

    const form = useForm<VendorForm>({
        initialValues: {
            name: '',
            contact_no: '',
            email: '',
            gstin: '',
            pan_no: '',
            fax: '',
            state: '',
            address: '',
            bank_accounts: [],
            contact_details: [],
            documents: [],
        },
        validate: {
            email: (value: string) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
        },
    });

    const handleSubmit = (values: VendorForm) => {
        console.log(values);
        // TODO: Implement form submission
    };

    const addBankAccount = () => {
        form.insertListItem('bank_accounts', {
            account_holder_name: '',
            account_number: '',
            bank_name: '',
            ifsc: '',
            branch_address: '',
        });
    };

    const addContactDetail = () => {
        form.insertListItem('contact_details', {
            contact_person: '',
            department: '',
            designation: '',
            phone: '',
            email: '',
        });
    };

    const addDocument = () => {
        form.insertListItem('documents', {
            document_type: '',
            document_name: '',
            document_number: '',
            remarks: '',
            sharing_option: 'public',
            file: null,
        });
    };

    return (
        <>
            <Button variant="outline" color="cyan" size="xs" radius="xs" onClick={open}>Add New</Button>
            <Modal
                opened={opened}
                onClose={close}
                size={'80%'}
                title="Add New Vendor"
            >
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Tabs value={activeTab} onChange={setActiveTab}>
                        <Tabs.List justify="flex-end">
                            <Tabs.Tab value="basic_profile">Basic Profile</Tabs.Tab>
                            <Tabs.Tab value="bank_details">Bank Details</Tabs.Tab>
                            <Tabs.Tab value="contact_details">Contact Details</Tabs.Tab>
                            <Tabs.Tab value="documents">Documents</Tabs.Tab>
                        </Tabs.List>

                        <Tabs.Panel value="basic_profile">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <TextInput
                                        label="Name"
                                        placeholder="Enter vendor name"
                                        required
                                        {...form.getInputProps('name')}
                                    />
                                    <TextInput
                                        label="Contact No"
                                        placeholder="Enter contact number"
                                        required
                                        {...form.getInputProps('contact_no')}
                                    />
                                    <TextInput
                                        label="Email"
                                        placeholder="Enter email address"
                                        type="email"
                                        required
                                        {...form.getInputProps('email')}
                                    />
                                    <TextInput
                                        label="GSTIN"
                                        placeholder="Enter GSTIN number"
                                        required
                                        {...form.getInputProps('gstin')}
                                    />
                                    <TextInput
                                        label="PAN No"
                                        placeholder="Enter PAN number"
                                        required
                                        {...form.getInputProps('pan_no')}
                                    />
                                    <TextInput
                                        label="Fax"
                                        placeholder="Enter fax number"
                                        {...form.getInputProps('fax')}
                                    />
                                </div>
                                <TextInput
                                    label="State"
                                    placeholder="Enter state"
                                    required
                                    className="mt-4"
                                    {...form.getInputProps('state')}
                                />
                                <Textarea
                                    label="Address"
                                    placeholder="Enter address"
                                    minRows={3}
                                    required
                                    className="mt-4"
                                    {...form.getInputProps('address')}
                                />
                            </div>
                        </Tabs.Panel>

                        <Tabs.Panel value="bank_details">
                            <Stack gap="md">
                                {form.values.bank_accounts.map((_: BankAccount, index: number) => (
                                    <div key={index} className="p-4 border rounded-lg relative">
                                        <ActionIcon
                                            color="red"
                                            variant="subtle"
                                            className="absolute top-2 right-2"
                                            onClick={() => form.removeListItem('bank_accounts', index)}
                                        >
                                            <TrashIcon size={16} />
                                        </ActionIcon>
                                        <div className="grid grid-cols-2 gap-4">
                                            <TextInput
                                                label="Account Holder Name"
                                                required
                                                {...form.getInputProps(`bank_accounts.${index}.account_holder_name`)}
                                            />
                                            <TextInput
                                                label="Account Number"
                                                required
                                                {...form.getInputProps(`bank_accounts.${index}.account_number`)}
                                            />
                                            <TextInput
                                                label="Bank Name"
                                                required
                                                {...form.getInputProps(`bank_accounts.${index}.bank_name`)}
                                            />
                                            <TextInput
                                                label="IFSC Code"
                                                required
                                                {...form.getInputProps(`bank_accounts.${index}.ifsc`)}
                                            />
                                            <TextInput
                                                label="Branch Address"
                                                className="col-span-2"
                                                {...form.getInputProps(`bank_accounts.${index}.branch_address`)}
                                            />
                                        </div>
                                    </div>
                                ))}
                                <Button
                                    leftSection={<PlusIcon size={16} />}
                                    variant="outline"
                                    onClick={addBankAccount}
                                >
                                    Add Bank Account
                                </Button>
                            </Stack>
                            <Stack gap="md">
                                {/* list of accounts */}
                            </Stack>
                        </Tabs.Panel>

                        <Tabs.Panel value="contact_details">
                            <Stack gap="md">
                                {form.values.contact_details.map((_: ContactDetail, index: number) => (
                                    <div key={index} className="p-4 border rounded-lg relative">
                                        <ActionIcon
                                            color="red"
                                            variant="subtle"
                                            className="absolute top-2 right-2"
                                            onClick={() => form.removeListItem('contact_details', index)}
                                        >
                                            <TrashIcon size={16} />
                                        </ActionIcon>
                                        <div className="grid grid-cols-2 gap-4">
                                            <TextInput
                                                label="Contact Person"
                                                required
                                                {...form.getInputProps(`contact_details.${index}.contact_person`)}
                                            />
                                            <TextInput
                                                label="Department"
                                                {...form.getInputProps(`contact_details.${index}.department`)}
                                            />
                                            <TextInput
                                                label="Designation"
                                                {...form.getInputProps(`contact_details.${index}.designation`)}
                                            />
                                            <TextInput
                                                label="Phone"
                                                {...form.getInputProps(`contact_details.${index}.phone`)}
                                            />
                                            <TextInput
                                                label="Email"
                                                type="email"
                                                className="col-span-2"
                                                {...form.getInputProps(`contact_details.${index}.email`)}
                                            />
                                        </div>
                                    </div>
                                ))}
                                <Button
                                    leftSection={<PlusIcon size={16} />}
                                    variant="outline"
                                    onClick={addContactDetail}
                                >
                                    Add Contact Person
                                </Button>
                            </Stack>
                        </Tabs.Panel>

                        <Tabs.Panel value="documents">
                            <Stack gap="md">
                                {form.values.documents.map((_: Document, index: number) => (
                                    <div key={index} className="p-4 border rounded-lg relative">
                                        <ActionIcon
                                            color="red"
                                            variant="subtle"
                                            className="absolute top-2 right-2"
                                            onClick={() => form.removeListItem('documents', index)}
                                        >
                                            <TrashIcon size={16} />
                                        </ActionIcon>
                                        <div className="grid grid-cols-2 gap-4">
                                            <TextInput
                                                label="Document Type"
                                                required
                                                {...form.getInputProps(`documents.${index}.document_type`)}
                                            />
                                            <TextInput
                                                label="Document Name"
                                                {...form.getInputProps(`documents.${index}.document_name`)}
                                            />
                                            <TextInput
                                                label="Document Number"
                                                {...form.getInputProps(`documents.${index}.document_number`)}
                                            />
                                            <Select
                                                label="Sharing Option"
                                                data={[
                                                    { value: 'public', label: 'Public' },
                                                    { value: 'private', label: 'Private' },
                                                ]}
                                                {...form.getInputProps(`documents.${index}.sharing_option`)}
                                            />
                                            <Textarea
                                                label="Remarks"
                                                className="col-span-2"
                                                {...form.getInputProps(`documents.${index}.remarks`)}
                                            />
                                            <FileInput
                                                label="Upload Document"
                                                className="col-span-2"
                                                onChange={(file) => form.setFieldValue(`documents.${index}.file`, file)}
                                            />
                                        </div>
                                    </div>
                                ))}
                                <Button
                                    leftSection={<PlusIcon size={16} />}
                                    variant="outline"
                                    onClick={addDocument}
                                >
                                    Add Document
                                </Button>
                            </Stack>
                        </Tabs.Panel>
                    </Tabs>

                    <Group justify="flex-end" mt="xl">
                        <Button variant="outline" onClick={close}>Cancel</Button>
                        <Button type="submit">Save Vendor</Button>
                    </Group>
                </form>
            </Modal>
        </>
    )
}

export default AddNew