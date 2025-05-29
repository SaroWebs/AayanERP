import React, { useState, useRef } from 'react'
import { useDisclosure } from '@mantine/hooks';
import { Modal, Button, Tabs, Textarea, TextInput, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import BankDetails from './Partials/Bank_detail'
import DocumentDetails from './Partials/Document_detail'
import ContactDetails from './Partials/Contact_detail'
import axios from 'axios';
interface ClientContact {
    id: number;
    contact_person: string;
    department: string;
    designation: string;
    phone: string;
    email: string;
    // contact_type: string;
    is_active: boolean;
}

interface ClientBankAccount {
    id: number;
    account_holder_name: string;
    bank_name: string;
    branch_address: string;
    account_number: string;
    ifsc: string;
    // account_type: string;
    // opening_balance: number;
}

interface ClientDocument {
    id: number;
    document_type: string;
    document_name: string;
    document_number: string | null;
    document_path: string;
    sharing_option: string;
    remarks: string | null;
}

interface Client {
    id: number;
    name: string;
    contact_no: string;
    email: string;
    gstin_no: string | null;
    pan_no: string | null;
    fax: string | null;
    state: string;
    company_type: string;
    turnover: number;
    range: string;
    address: string;
    correspondence_address: string;
    contacts: ClientContact[];
    bank_accounts: ClientBankAccount[];
    documents: ClientDocument[];
    created_at: string | null;
    updated_at: string | null;
}

const AddNew = () => {
    const [opened, { open, close }] = useDisclosure(false);
    const [activeTab, setActiveTab] = useState<string | null>('basic_profile');
    const formRef = useRef<HTMLFormElement>(null);

    // State for subcomponent data
    const [bankAccounts, setBankAccounts] = useState<ClientBankAccount[]>([]);
    const [contactDetails, setContactDetails] = useState<ClientContact[]>([]);
    const [documents, setDocuments] = useState<ClientDocument[]>([]);

    const form = useForm<Client>({
        initialValues: {
            name: '',
            contact_no: '',
            email: '',
            gstin_no: '',
            pan_no: '',
            fax: '',
            state: '',
            company_type: '',
            turnover: 'null',
            range: '',
            address: '',
            correspondence_address: '',
        },
        validateInputOnBlur: false,
        validateInputOnChange: false,
    });

    const handleSubmit = (values: Client) => {
        try {
            const formData = new FormData();

            // Basic client details
            formData.append('name', values.name);
            formData.append('contact_no', values.contact_no);
            formData.append('email', values.email);
            formData.append('gstin_no', values.gstin_no || '');
            formData.append('pan_no', values.pan_no || '');
            formData.append('fax', values.fax || '');
            formData.append('state', values.state);
            formData.append('company_type', values.company_type);
            formData.append('turnover', values.turnover.toString());
            formData.append('range', values.range);
            formData.append('address', values.address);
            formData.append('correspondence_address', values.correspondence_address);

            // Bank accounts
            bankAccounts.forEach((account, index) => {
                formData.append(`bank_accounts[${index}][bank_name]`, account.bank_name);
                formData.append(`bank_accounts[${index}][branch_address]`, account.branch_address);
                formData.append(`bank_accounts[${index}][account_number]`, account.account_number);
                formData.append(`bank_accounts[${index}][ifsc]`, account.ifsc);
                // formData.append(`bank_accounts[${index}][account_type]`, account.account_type);
                // formData.append(`bank_accounts[${index}][opening_balance]`, account.opening_balance.toString());
            });

            // Contact details
            contactDetails.forEach((contact, index) => {
                formData.append(`contacts[${index}][contact_person]`, contact.contact_person);
                formData.append(`contacts[${index}][designation]`, contact.designation);
                formData.append(`contacts[${index}][phone]`, contact.phone);
                formData.append(`contacts[${index}][email]`, contact.email);
                // formData.append(`contacts[${index}][contact_type]`, contact.contact_type);
                formData.append(`contacts[${index}][is_active]`, contact.is_active.toString());
            });

            // Documents
            documents.forEach((doc, index) => {
                formData.append(`documents[${index}][document_type]`, doc.document_type);
                formData.append(`documents[${index}][document_name]`, doc.document_name);
                formData.append(`documents[${index}][document_number]`, doc.document_number || '');
                formData.append(`documents[${index}][sharing_option]`, doc.sharing_option);
                formData.append(`documents[${index}][remarks]`, doc.remarks || '');
                if (doc.file) {
                    formData.append(`documents[${index}][file]`, doc.file);
                }
            });
            console.log(formData);
            axios.post('/data/clients/add', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
                .then(res => {
                    notifications.show({
                        title: 'Success',
                        message: 'Client added successfully',
                        color: 'green',
                    });
                    close();
                    console.log(res.data);
                })
                .catch(err => {
                    notifications.show({
                        title: 'Error',
                        message: 'Failed to add client',
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

    const handleSaveClient = () => {
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
                title="Add New Client"
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
                                        placeholder="Enter client name"
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
                                        {...form.getInputProps('gstin_no')}
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
                                    <TextInput
                                        label="State"
                                        placeholder="Enter state"
                                        required
                                        {...form.getInputProps('state')}
                                    />
                                    <TextInput
                                        label="Company Type"
                                        placeholder="Enter company type"
                                        required
                                        {...form.getInputProps('company_type')}
                                    />
                                    <TextInput
                                        label="Turnover"
                                        type="number"
                                        placeholder="Enter turnover"
                                        required
                                        {...form.getInputProps('turnover')}
                                    />
                                    <TextInput
                                        label="Range"
                                        placeholder="Enter range"
                                        required
                                        {...form.getInputProps('range')}
                                    />
                                </div>
                                <Textarea
                                    label="Address"
                                    placeholder="Enter address"
                                    minRows={3}
                                    required
                                    {...form.getInputProps('address')}
                                />
                                <Textarea
                                    label="Correspondence Address"
                                    placeholder="Enter correspondence address"
                                    minRows={3}
                                    required
                                    {...form.getInputProps('correspondence_address')}
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
                    <Button onClick={handleSaveClient}>
                        Save Client
                    </Button>
                </Group>
            </Modal>
        </>
    )
}

export default AddNew