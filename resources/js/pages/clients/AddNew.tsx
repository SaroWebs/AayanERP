import React, { useState, useRef } from 'react'
import { useDisclosure } from '@mantine/hooks';
import { Modal, Button, Tabs, Textarea, TextInput, Group, Select, NumberInput, LoadingOverlay, Checkbox, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import BankDetails from './Partials/BankDetail'
import DocumentDetails from './Partials/DocumentDetail'
import ContactDetails from './Partials/ContactDetail'
import axios from 'axios';
import { Contact, BankAccount, Document, ClientForm } from './types';

const AddNew = () => {
    const [opened, { open, close }] = useDisclosure(false);
    const [activeTab, setActiveTab] = useState<string | null>('basic_profile');
    const [loading, setLoading] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    // State for subcomponent data
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [sameAsAddress, setSameAsAddress] = useState(false);

    const form = useForm<ClientForm>({
        initialValues: {
            name: '',
            contact_no: '',
            email: '',
            gstin_no: '',
            pan_no: '',
            fax: '',
            state: '',
            company_type: 'regional',
            turnover: 0,
            range: 'NA',
            address: '',
            correspondence_address: '',
        },
        validate: {
            name: (value) => (!value ? 'Name is required' : null),
            contact_no: (value) => {
                if (!value) return 'Contact number is required';
                if (!/^[0-9]{10}$/.test(value)) return 'Invalid contact number';
                return null;
            },
            email: (value) => {
                if (!value) return 'Email is required';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email';
                return null;
            },
            gstin_no: (value) => {
                if (value && value.length < 5) return 'GSTIN number must be at least 15 characters';
                return null;
            },
            pan_no: (value) => {
                if (value && value.length < 5) {
                    return 'PAN number must be at least 10 characters';
                }
                return null;
            },
            state: (value) => (!value ? 'State is required' : null),
            company_type: (value) => (!value ? 'Company type is required' : null),
            turnover: (value) => (value < 0 ? 'Turnover cannot be negative' : null),
        },
    });

    const handleSameAsAddressChange = (checked: boolean) => {
        setSameAsAddress(checked);
        if (checked) {
            form.setFieldValue('correspondence_address', form.values.address);
        }
    };

    const handleSubmit = async (values: ClientForm) => {
        try {
            setLoading(true);
            const formData = new FormData();

            // Basic client details
            Object.entries(values).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    formData.append(key, value.toString());
                }
            });

            // Append bank accounts
            bankAccounts.forEach((account, index) => {
                Object.entries(account).forEach(([key, value]) => {
                    if (value !== null && value !== undefined) {
                        formData.append(`bank_accounts[${index}][${key}]`, value.toString());
                    }
                });
            });

            // Append contacts
            contacts.forEach((contact, index) => {
                Object.entries(contact).forEach(([key, value]) => {
                    if (value !== null && value !== undefined) {
                        formData.append(`contact_details[${index}][${key}]`, value.toString());
                    }
                });
            });

            // Append documents
            documents.forEach((doc, index) => {
                Object.entries(doc).forEach(([key, value]) => {
                    if (value !== null && value !== undefined) {
                        if (key === 'document_path' && value instanceof File) {
                            formData.append(`documents[${index}][${key}]`, value);
                        } else {
                            formData.append(`documents[${index}][${key}]`, value.toString());
                        }
                    }
                });
            });

            await axios.post('/data/clients/add', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            notifications.show({
                title: 'Success',
                message: 'Client added successfully',
                color: 'green',
            });
            close();
            form.reset();
            setBankAccounts([]);
            setContacts([]);
            setDocuments([]);
        } catch (error: any) {
            notifications.show({
                title: 'Error',
                message: error.response?.data?.message || 'Failed to add client',
                color: 'red',
            });
        } finally {
            setLoading(false);
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
                <LoadingOverlay visible={loading} />
                <Tabs value={activeTab} onChange={setActiveTab}>
                    <Tabs.List justify="flex-end">
                        <Tabs.Tab value="basic_profile">Basic Profile</Tabs.Tab>
                        <Tabs.Tab value="bank_details">Bank Details</Tabs.Tab>
                        <Tabs.Tab value="contact_details">Contact Details</Tabs.Tab>
                        <Tabs.Tab value="documents">Documents</Tabs.Tab>
                    </Tabs.List>

                    <Stack gap="lg" mt="md">
                        <Tabs.Panel value="basic_profile">
                            <form ref={formRef} onSubmit={form.onSubmit(handleSubmit)}>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <TextInput
                                            label="Name"
                                            placeholder="Enter client name"
                                            required
                                            {...form.getInputProps('name')}
                                        />
                                        <TextInput
                                            label="Contact No"
                                            placeholder="Enter 10-digit contact number"
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
                                            placeholder="Enter 15-digit GSTIN"
                                            {...form.getInputProps('gstin_no')}
                                        />
                                        <TextInput
                                            label="PAN No"
                                            placeholder="Enter 10-digit PAN"
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
                                        <Select
                                            label="Company Type"
                                            placeholder="Select company type"
                                            required
                                            data={[
                                                { value: 'regional', label: 'Regional' },
                                                { value: 'national', label: 'National' },
                                                { value: 'government', label: 'Government' },
                                            ]}
                                            {...form.getInputProps('company_type')}
                                        />
                                        <NumberInput
                                            label="Turnover"
                                            placeholder="Enter turnover amount"
                                            required
                                            min={0}
                                            decimalScale={2}
                                            {...form.getInputProps('turnover')}
                                        />
                                        <Select
                                            label="Range"
                                            placeholder="Select range"
                                            data={[
                                                { value: 'state', label: 'State' },
                                                { value: 'central', label: 'Central' },
                                                { value: 'NA', label: 'Not Applicable' },
                                            ]}
                                            {...form.getInputProps('range')}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 gap-6">
                                        <Textarea
                                            label="Address"
                                            placeholder="Enter complete address"
                                            required
                                            minRows={3}
                                            {...form.getInputProps('address')}
                                            onChange={(e) => {
                                                form.setFieldValue('address', e.target.value);
                                                if (sameAsAddress) {
                                                    form.setFieldValue('correspondence_address', e.target.value);
                                                }
                                            }}
                                        />
                                        <Checkbox
                                            label="Correspondence address is same as address"
                                            checked={sameAsAddress}
                                            onChange={(e) => handleSameAsAddressChange(e.currentTarget.checked)}
                                        />
                                        <Textarea
                                            label="Correspondence Address"
                                            placeholder="Enter correspondence address"
                                            minRows={3}
                                            {...form.getInputProps('correspondence_address')}
                                            disabled={sameAsAddress}
                                        />
                                    </div>
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
                                contacts={contacts}
                                onContactsChange={setContacts}
                            />
                        </Tabs.Panel>

                        <Tabs.Panel value="documents">
                            <DocumentDetails
                                documents={documents}
                                onDocumentsChange={setDocuments}
                            />
                        </Tabs.Panel>
                    </Stack>
                </Tabs>

                <Group justify="flex-end" mt="xl">
                    <Button variant="outline" onClick={close}>Cancel</Button>
                    <Button onClick={handleSaveClient} loading={loading}>
                        Save Client
                    </Button>
                </Group>
            </Modal>
        </>
    );
};

export default AddNew;