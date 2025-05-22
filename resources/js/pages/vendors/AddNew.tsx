import React, { useState, useRef, useMemo } from 'react'
import { useDisclosure } from '@mantine/hooks';
import { Modal, Button, Tabs, Textarea, TextInput, Group } from '@mantine/core';
import { useForm } from '@mantine/form';

import BankDetails from './partial/BankDetails'
import DocumentDetails from './partial/DocumentDetails'
import ContactDetails from './partial/ContactDetails';

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
}

const AddNew = () => {
    const [opened, { open, close }] = useDisclosure(false);
    const [activeTab, setActiveTab] = useState<string | null>('basic_profile');
    const formRef = useRef<HTMLFormElement>(null);
    
    // State for subcomponent data
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const [contactDetails, setContactDetails] = useState<ContactDetail[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);

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
        },
        validate: {
            name: (value) => (!value ? 'Name is required' : null),
            email: (value) => {
                if (!value) return 'Email is required';
                if (!/^\S+@\S+$/.test(value)) return 'Invalid email';
                return null;
            },
            state: (value) => (!value ? 'State is required' : null),
            address: (value) => (!value ? 'Address is required' : null),
        },
    });

    const handleSubmit = (values: VendorForm) => {
        const completeVendorData = {
            ...values,
            bank_accounts: bankAccounts,
            contact_details: contactDetails,
            documents: documents,
        };
        console.log(completeVendorData);
    };

    const handleSaveVendor = () => {
        if (formRef.current) {
            formRef.current.requestSubmit();
        }
    };

    const isFormValid = useMemo(() => {
        const errors = form.validate();
        return Object.keys(errors).length === 0;
    }, [form.values]);

    return (
        <>
            <Button variant="outline" color="cyan" size="xs" radius="xs" onClick={open}>Add New</Button>
            <Modal
                opened={opened}
                onClose={close}
                size={'80%'}
                title="Add New Vendor"
            >
                <Tabs value={activeTab} onChange={setActiveTab}>
                    <Tabs.List justify="flex-end">
                        <Tabs.Tab value="basic_profile">Basic Profile</Tabs.Tab>
                        <Tabs.Tab value="bank_details">Bank Details</Tabs.Tab>
                        <Tabs.Tab value="contact_details">Contact Details</Tabs.Tab>
                        <Tabs.Tab value="documents">Documents</Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="basic_profile">
                        <form ref={formRef} onSubmit={form.onSubmit(handleSubmit)}>
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
                        </form>
                    </Tabs.Panel>

                    <Tabs.Panel value="bank_details">
                        <BankDetails 
                            bankAccounts={bankAccounts}
                            onBankAccountsChange={setBankAccounts}
                        />
                    </Tabs.Panel>

                    <Tabs.Panel value="contact_details">
                        <ContactDetails 
                            contactDetails={contactDetails}
                            onContactDetailsChange={setContactDetails}
                        />
                    </Tabs.Panel>

                    <Tabs.Panel value="documents">
                        <DocumentDetails 
                            documents={documents}
                            onDocumentsChange={setDocuments}
                        />
                    </Tabs.Panel>
                </Tabs>

                <Group justify="flex-end" mt="xl">
                    <Button variant="outline" onClick={close}>Cancel</Button>
                    <Button 
                        onClick={handleSaveVendor}
                        disabled={!isFormValid}
                    >
                        Save Vendor
                    </Button>
                </Group>
            </Modal>
        </>
    )
}

export default AddNew