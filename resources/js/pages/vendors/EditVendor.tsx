import React, { useState } from 'react';
import { Modal, Button, Tabs, TextInput, Group, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import BankDetails from './partial/BankDetails';
import DocumentDetails from './partial/DocumentDetails';
import ContactDetails from './partial/ContactDetails';
import axios from 'axios';
import {
    EditVendorProps,
    VendorForm,
    BankAccount,
    ContactDetail,
    Document as VendorDocument
} from './types';

const EditVendor: React.FC<EditVendorProps> = ({ vendor, onClose, onUpdate }) => {

    const [activeTab, setActiveTab] = useState<string | null>('basic_profile');
    const [isSubmitting, setIsSubmitting] = useState<string | null>(null);

    const handleClose = () => {
        onClose();
    }
    // State for subcomponent data
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(
        vendor.bank_accounts.map(account => ({
            account_holder_name: account.account_holder_name,
            account_number: account.account_number,
            bank_name: account.bank_name,
            ifsc: account.ifsc,
            branch_address: account.branch_address || '',
        }))
    );

    const [contactDetails, setContactDetails] = useState<ContactDetail[]>(
        vendor.contact_details.map(contact => ({
            name: contact.name,
            designation: contact.designation || '',
            mobile: contact.phone || '',
            email: contact.email || '',
            landline: contact.department || '',
            is_primary: false
        }))
    );

    const [documents, setDocuments] = useState<VendorDocument[]>(
        vendor.documents.map(doc => ({
            document_type: doc.document_type,
            document_name: doc.document_name || '',
            document_number: doc.document_number || '',
            remarks: doc.remarks || '',
            sharing_option: doc.sharing_option,
        }))
    );

    const basicForm = useForm<VendorForm>({
        initialValues: {
            name: vendor.name,
            contact_no: vendor.contact_no,
            email: vendor.email,
            gstin: vendor.gstin,
            pan_no: vendor.pan_no,
            fax: vendor.fax,
            state: vendor.state,
            address: vendor.address,
        },
        validateInputOnBlur: false,
        validateInputOnChange: false,
    });

    const handleBasicSubmit = async (values: VendorForm) => {
        try {
            setIsSubmitting('basic');
            const formData = new FormData();
            formData.append('name', values.name);
            formData.append('contact_no', values.contact_no || '');
            formData.append('email', values.email);
            formData.append('gstin', values.gstin || '');
            formData.append('pan_no', values.pan_no || '');
            formData.append('fax', values.fax || '');
            formData.append('state', values.state || '');
            formData.append('address', values.address || '');

            await axios.patch(`/data/vendors/${vendor.id}/basic`, formData);

            notifications.show({
                title: 'Success',
                message: 'Basic information updated successfully',
                color: 'green',
            });

            // Fetch updated vendor data
            const response = await axios.get(`/master/vendors/${vendor.id}`);
            onUpdate(response.data);
        } catch (error: any) {
            notifications.show({
                title: 'Error',
                message: error.response?.data?.message || 'Failed to update basic information',
                color: 'red',
            });
            console.error(error.response);
        } finally {
            setIsSubmitting(null);
        }
    };

    const handleBankSubmit = async () => {
        try {
            setIsSubmitting('bank');
            const data = {
                bank_accounts: bankAccounts.map(account => ({
                    account_holder_name: account.account_holder_name,
                    account_number: account.account_number,
                    bank_name: account.bank_name,
                    ifsc: account.ifsc,
                    branch_address: account.branch_address || ''
                }))
            };

            const response = await axios.patch(
                `/data/vendors/${vendor.id}/bank-accounts`, 
                data,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            notifications.show({
                title: 'Success',
                message: response.data.message,
                color: 'green',
            });

            onUpdate(response.data.vendor);
        } catch (error: any) {
            notifications.show({
                title: 'Error',
                message: error.response?.data?.message || 'Failed to update bank accounts',
                color: 'red',
            });
            console.error(error.response);
        } finally {
            setIsSubmitting(null);
        }
    };

    const handleContactSubmit = async () => {
        try {
            setIsSubmitting('contact');
            const data = {
                contact_details: contactDetails.map(contact => ({
                    name: contact.name,
                    designation: contact.designation || '',
                    mobile: contact.mobile || '',
                    email: contact.email || '',
                    landline: contact.landline || '',
                    is_primary: contact.is_primary
                }))
            };

            const response = await axios.patch(
                `/data/vendors/${vendor.id}/contact-details`, 
                data,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            notifications.show({
                title: 'Success',
                message: response.data.message,
                color: 'green',
            });

            onUpdate(response.data.vendor);
        } catch (error: any) {
            notifications.show({
                title: 'Error',
                message: error.response?.data?.message || 'Failed to update contact details',
                color: 'red',
            });
            console.error(error.response);
        } finally {
            setIsSubmitting(null);
        }
    };

    const handleDocumentSubmit = async () => {
        try {
            setIsSubmitting('document');
            // For documents, we still need FormData because of file uploads
            const formData = new FormData();
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

            const response = await axios.patch(
                `/data/vendors/${vendor.id}/documents`, 
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            console.log(response);
            
            // notifications.show({
            //     title: 'Success',
            //     message: response.data.message,
            //     color: 'green',
            // });

            // onUpdate(response.data.vendor);
        } catch (error: any) {
            notifications.show({
                title: 'Error',
                message: error.response?.data?.message || 'Failed to update documents',
                color: 'red',
            });
            console.error(error.response);
        } finally {
            setIsSubmitting(null);
        }
    };

    return (
        <Modal
            opened={true}
            onClose={handleClose}
            size={'80%'}
            title="Edit Vendor"
        >
            <Tabs value={activeTab} onChange={setActiveTab}>
                <Tabs.List justify="flex-end">
                    <Tabs.Tab value="basic_profile">Basic Profile</Tabs.Tab>
                    <Tabs.Tab value="bank_details">Bank Details</Tabs.Tab>
                    <Tabs.Tab value="contact_details">Contact Details</Tabs.Tab>
                    <Tabs.Tab value="documents">Documents</Tabs.Tab>
                </Tabs.List>

                <Stack gap="lg" mt="md">
                    <Tabs.Panel value="basic_profile">
                        <form onSubmit={basicForm.onSubmit(handleBasicSubmit)}>
                            <div className="grid grid-cols-2 gap-4">
                                <TextInput
                                    label="Name"
                                    placeholder="Enter vendor name"
                                    required
                                    {...basicForm.getInputProps('name')}
                                />
                                <TextInput
                                    label="Contact No"
                                    placeholder="Enter contact number"
                                    required
                                    {...basicForm.getInputProps('contact_no')}
                                />
                                <TextInput
                                    label="Email"
                                    placeholder="Enter email address"
                                    type="email"
                                    required
                                    {...basicForm.getInputProps('email')}
                                />
                                <TextInput
                                    label="GSTIN"
                                    placeholder="Enter GSTIN number"
                                    {...basicForm.getInputProps('gstin')}
                                />
                                <TextInput
                                    label="PAN No"
                                    placeholder="Enter PAN number"
                                    {...basicForm.getInputProps('pan_no')}
                                />
                                <TextInput
                                    label="Fax"
                                    placeholder="Enter fax number"
                                    {...basicForm.getInputProps('fax')}
                                />
                                <TextInput
                                    label="State"
                                    placeholder="Enter state"
                                    {...basicForm.getInputProps('state')}
                                />
                                <TextInput
                                    label="Address"
                                    placeholder="Enter address"
                                    {...basicForm.getInputProps('address')}
                                />
                            </div>
                            <Group justify="flex-end" mt="xl">
                                <Button
                                    type="submit"
                                    loading={isSubmitting === 'basic'}
                                >
                                    Update Basic Info
                                </Button>
                            </Group>
                        </form>
                    </Tabs.Panel>

                    <Tabs.Panel value="bank_details">
                        <BankDetails
                            bankAccounts={bankAccounts}
                            setBankAccounts={setBankAccounts}
                            isEdit={true}
                        />
                        <Group justify="flex-end" mt="xl">
                            <Button
                                onClick={handleBankSubmit}
                                loading={isSubmitting === 'bank'}
                            >
                                Update Bank Details
                            </Button>
                        </Group>
                    </Tabs.Panel>

                    <Tabs.Panel value="contact_details">
                        <ContactDetails
                            contactDetails={contactDetails}
                            setContactDetails={setContactDetails}
                            isEdit={true}
                        />
                        <Group justify="flex-end" mt="xl">
                            <Button
                                onClick={handleContactSubmit}
                                loading={isSubmitting === 'contact'}
                            >
                                Update Contact Details
                            </Button>
                        </Group>
                    </Tabs.Panel>

                    <Tabs.Panel value="documents">
                        <DocumentDetails
                            documents={documents}
                            setDocuments={setDocuments}
                            isEdit={true}
                        />
                        <Group justify="flex-end" mt="xl">
                            <Button
                                onClick={handleDocumentSubmit}
                                loading={isSubmitting === 'document'}
                            >
                                Update Documents
                            </Button>
                        </Group>
                    </Tabs.Panel>
                </Stack>

                <Group justify="flex-end" mt="xl">
                    <Button variant="outline" onClick={handleClose}>Close</Button>
                </Group>
            </Tabs>
        </Modal>
    );
};

export default EditVendor; 