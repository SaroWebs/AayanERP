import { useState, useEffect } from "react";
import { Button, TextInput, Select } from '@mantine/core';
import axios from "axios";
import { notifications } from "@mantine/notifications";

interface BankAccount {
    account_holder_name: string;
    account_number: string;
    bank_name: string;
    ifsc: string;
    branch_address: string;
}

interface BankDetailsProps {
    bankAccounts: BankAccount[];
    onBankAccountsChange: (accounts: BankAccount[]) => void;
}

// Define required fields
const REQUIRED_FIELDS: (keyof BankAccount)[] = ['account_holder_name', 'account_number', 'ifsc'];

interface BankName {
    value: string;
    label: string;
}

const BankDetails = ({ bankAccounts, onBankAccountsChange }: BankDetailsProps) => {
    const [bankInfo, setBankInfo] = useState<BankAccount>({
        account_holder_name: '',
        account_number: '',
        bank_name: '',
        ifsc: '',
        branch_address: '',
    });
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [bankNames, setBankNames] = useState<BankName[]>([]);

    useEffect(() => {
        const loadBankNames = async () => {
            try {
                const response = await axios.get('/assets/data/banknames.json');
                const data = response.data;
                const formattedBankNames = Object.entries(data).map(([value, label]) => ({
                    value,
                    label: label as string
                }));
                setBankNames(formattedBankNames);
            } catch (err: any) {
                notifications.show({
                    title: 'Error',
                    message: err.response?.data?.message || 'Failed to fetch bank details',
                    color: 'red',
                });

            }
        };

        loadBankNames();
    }, []);

    const validateRequiredFields = (data: BankAccount): boolean => {
        return REQUIRED_FIELDS.every(field => {
            const value = data[field];
            return value !== undefined && value !== null && value.trim() !== '';
        });
    };

    const handleSearch = async () => {
        if (!bankInfo.ifsc) return;

        setIsSearching(true);
        try {
            const response = await axios.get(`https://ifsc.razorpay.com/${bankInfo.ifsc}`);
            const data = response.data;

            setBankInfo(prev => ({
                ...prev,
                bank_name: data.BANKCODE || prev.bank_name,
                branch_address: data.ADDRESS || prev.branch_address
            }));
        } catch (err: any) {
            notifications.show({
                title: 'Error',
                message: err.message || 'Failed to fetch bank details',
                color: 'red',
            });
        } finally {
            setIsSearching(false);
        }
    };

    const resetForm = () => {
        setBankInfo({
            account_holder_name: '',
            account_number: '',
            bank_name: '',
            ifsc: '',
            branch_address: '',
        });
        setEditingIndex(null);
    };

    const handleSubmit = () => {
        if (!validateRequiredFields(bankInfo)) {
            notifications.show({
                title: 'Validation Error',
                message: 'Please fill in all required fields',
                color: 'red',
            });
            return;
        }

        if (editingIndex !== null) {
            const updatedAccounts = [...bankAccounts];
            updatedAccounts[editingIndex] = bankInfo;
            onBankAccountsChange(updatedAccounts);
            notifications.show({
                title: 'Success',
                message: 'Bank account updated successfully',
                color: 'green',
            });
        } else {
            onBankAccountsChange([...bankAccounts, bankInfo]);
            notifications.show({
                title: 'Success',
                message: 'Bank account added successfully',
                color: 'green',
            });
        }
        resetForm();
    };

    const handleEdit = (index: number) => {
        setEditingIndex(index);
        setBankInfo(bankAccounts[index]);
    };

    const handleDelete = (index: number) => {
        const updatedAccounts = bankAccounts.filter((_, i) => i !== index);
        onBankAccountsChange(updatedAccounts);
        resetForm();
        notifications.show({
            title: 'Success',
            message: 'Bank account deleted successfully',
            color: 'green',
        });
    };

    return (
        <div className="space-y-6">
            <div className="rounded-lg shadow-md p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                        {editingIndex !== null ? 'Edit Bank Account' : 'Add New Bank Account'}
                    </h3>
                    <Button variant="subtle" color="gray" onClick={resetForm}>Clear</Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <TextInput
                        label="Account Holder Name"
                        value={bankInfo.account_holder_name}
                        onChange={(e) => setBankInfo({ ...bankInfo, account_holder_name: e.target.value })}
                        required
                    />
                    <TextInput
                        label="Account Number"
                        value={bankInfo.account_number}
                        onChange={(e) => setBankInfo({ ...bankInfo, account_number: e.target.value })}
                        required
                    />
                    <Select
                        label="Bank Name"
                        value={bankInfo.bank_name}
                        onChange={(value) => setBankInfo({ ...bankInfo, bank_name: value || '' })}
                        data={bankNames}
                        searchable
                        clearable
                        placeholder="Select a bank"
                    />
                    <div className="flex gap-2">
                        <TextInput
                            label="IFSC Code"
                            value={bankInfo.ifsc}
                            onChange={(e) => setBankInfo({ ...bankInfo, ifsc: e.target.value })}
                            required
                            className="flex-1"
                        />
                        <Button
                            onClick={handleSearch}
                            loading={isSearching}
                            className="mt-6"
                        >
                            Search
                        </Button>
                    </div>
                    <TextInput
                        label="Branch Address"
                        className="col-span-2"
                        value={bankInfo.branch_address}
                        onChange={(e) => setBankInfo({ ...bankInfo, branch_address: e.target.value })}
                    />
                </div>
               
                <Button
                    className="mt-4"
                    onClick={handleSubmit}
                    disabled={!validateRequiredFields(bankInfo)}
                >
                    {editingIndex !== null ? 'Update Bank' : 'Add Bank'}
                </Button>
            </div>

            {bankAccounts.length > 0 && (
                <div className="rounded-lg border overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="px-4 py-2">Holder Name</th>
                                <th className="px-4 py-2">Account No</th>
                                <th className="px-4 py-2">Bank (Code) </th>
                                <th className="px-4 py-2">IFSC</th>
                                <th className="px-4 py-2">Branch Address</th>
                                <th className="px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bankAccounts.map((bank, index) => (
                                <tr key={index} className="border-b text-sm">
                                    <td className="px-4 py-2">{bank.account_holder_name}</td>
                                    <td className="px-4 py-2">{bank.account_number}</td>
                                    <td className="px-4 py-2">{bank.bank_name}</td>
                                    <td className="px-4 py-2">{bank.ifsc}</td>
                                    <td className="px-4 py-2">{bank.branch_address}</td>
                                    <td className="px-4 py-2">
                                        <Button size="xs" variant="subtle" color="blue" onClick={() => handleEdit(index)}>Edit</Button>
                                        <Button size="xs" variant="subtle" color="red" onClick={() => handleDelete(index)}>Delete</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default BankDetails; 