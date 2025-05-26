import React, { useState, useRef } from 'react'
import { useDisclosure } from '@mantine/hooks';
import { Modal, Button, Tabs, Textarea, TextInput, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import BankDetails from './partial/BankDetails'
import DocumentDetails from './partial/DocumentDetails'
import ContactDetails from './partial/ContactDetails';
import axios from 'axios';

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
        validateInputOnBlur: false,
        validateInputOnChange: false,
    });

    const handleSubmit = (values: VendorForm) => {
        try {
            const formData = new FormData();

            formData.append('name', values.name);
            formData.append('contact_no', values.contact_no || '');
            formData.append('email', values.email);
            formData.append('gstin', values.gstin || '');
            formData.append('pan_no', values.pan_no || '');
            formData.append('fax', values.fax || '');
            formData.append('state', values.state || '');
            formData.append('address', values.address || '');

            // Append Bank Accounts
            bankAccounts.forEach((account, index) => {
                formData.append(`bank_accounts[${index}][account_holder_name]`, account.account_holder_name);
                formData.append(`bank_accounts[${index}][account_number]`, account.account_number);
                formData.append(`bank_accounts[${index}][bank_name]`, account.bank_name);
                formData.append(`bank_accounts[${index}][ifsc]`, account.ifsc);
                formData.append(`bank_accounts[${index}][branch_address]`, account.branch_address || '');
            });

            // Append Contact Details
            contactDetails.forEach((contact, index) => {
                formData.append(`contact_details[${index}][contact_person]`, contact.contact_person);
                formData.append(`contact_details[${index}][department]`, contact.department || '');
                formData.append(`contact_details[${index}][designation]`, contact.designation || '');
                formData.append(`contact_details[${index}][phone]`, contact.phone || '');
                formData.append(`contact_details[${index}][email]`, contact.email || '');
            });

            // Append Documents
            documents.forEach((doc, index) => {
                formData.append(`documents[${index}][document_type]`, doc.document_type);
                formData.append(`documents[${index}][document_name]`, doc.document_name || '');
                formData.append(`documents[${index}][document_number]`, doc.document_number || '');
                formData.append(`documents[${index}][remarks]`, doc.remarks || '');
                formData.append(`documents[${index}][sharing_option]`, doc.sharing_option);
                if (doc.file) {
                    formData.append(`documents[${index}][file]`, doc.file);
                }
            });

            axios.post('/data/vendors/add', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
                .then(res => {
                    notifications.show({
                        title: 'Success',
                        message: 'Vendor added successfully',
                        color: 'green',
                    });
                    close();
                    console.log(res.data);
                })
                .catch(err => {
                    notifications.show({
                        title: 'Error',
                        message: 'Failed to add vendor',
                        color: 'red',
                    });
                    console.log(err.response);
                });

        } catch (error) {
            notifications.show({
                title: 'Error',
                message: 'Fill the required fields first.',
                color: 'red',
            });
            setActiveTab('basic_profile');
        }
    };


    const handleSaveVendor = () => {
        if (formRef.current) {
            setActiveTab('basic_profile');
            setTimeout(() => {
                formRef.current?.requestSubmit();
            }, 100);
        }
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
                                        {...form.getInputProps('gstin')}
                                    />
                                    <TextInput
                                        label="PAN No"
                                        placeholder="Enter PAN number"
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
                                    className="mt-4"
                                    {...form.getInputProps('state')}
                                />
                                <Textarea
                                    label="Address"
                                    placeholder="Enter address"
                                    minRows={3}
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
                    >
                        Save Vendor
                    </Button>
                </Group>
            </Modal>
        </>
    )
}

export default AddNew