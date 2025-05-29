import { useState, useRef } from 'react';
import { Modal, Button, Tabs, TextInput, Group, Stack, Select, Textarea, Checkbox, FileInput, ActionIcon, Paper, Grid, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import axios from 'axios';
import AddressDetails from './Partial/AddressDetails';
import DocumentSubmitted from './Partial/Documents';
import type { Documents } from './Partial/Documents';
import EmploymentDetails from './Partial/EmploymentDetails';
import type { EmploymentDetail } from './Partial/EmploymentDetails';
import ServiceDetail from './Partial/Service_detail';
import type { ServiceDetail as ServiceDetailType } from './Partial/Service_detail';
import DocumentIssued from './Partial/DocumentIssued';
import type { DocumentIssue } from './Partial/DocumentIssued';
import OtherDetails from './Partial/OtherDetails';
import EducationalDetails from './Partial/EducationalDetails';
import ProfessionalDetails from './Partial/ProfessionalDetails';
import {
    Employee,
    EmployeeProfile,
    EducationalQualification,
    ProfessionalQualification,
    Address,
    Child,
    Spouse,
    Nominee,
    Reference,
    KnownLanguage,
    SpecialTraining,
    CurricularActivity,
    REQUIRED_EDUCATIONAL_FIELDS,
    REQUIRED_PROFESSIONAL_FIELDS
} from './types';

interface EditEmployeeProps {
    employee: Employee;
    onClose: () => void;
    onUpdate: (employee: Employee) => void;
}

const EditEmployee = ({ employee, onClose, onUpdate }: EditEmployeeProps) => {
    const [activeTab, setActiveTab] = useState<string | null>('basic_profile');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    // State for subcomponent data
    const [educationalList, setEducationalList] = useState<EducationalQualification[]>(
        (employee.educational_qualifications || []).map(q => ({
            qualification_type: q.qualification_type,
            institution: q.institution,
            board_university: q.board_university,
            year_of_passing: q.year_of_passing,
            marks_percentage: q.marks_percentage,
            grade: q.grade,
            specialization: q.specialization,
            medium: q.medium,
            subject: q.subject
        }))
    );
    const [educationalInput, setEducationalInput] = useState<EducationalQualification>({
        qualification_type: '',
        institution: '',
        board_university: '',
        year_of_passing: '',
        marks_percentage: '',
        grade: '',
        specialization: null,
        medium: '',
        subject: ''
    });
    const [editingEducationalIndex, setEditingEducationalIndex] = useState<number | null>(null);

    const [professionalList, setProfessionalList] = useState<ProfessionalQualification[]>(
        (employee.professional_qualifications || []).map(q => ({
            exam_name: q.qualification_type,
            institution: q.institution,
            division: null,
            completion_year: q.year_of_passing,
            certificate_number: null,
            valid_from: null,
            valid_until: null,
            remarks: null
        }))
    );
    const [professionalInput, setProfessionalInput] = useState<ProfessionalQualification>({
        exam_name: '',
        institution: '',
        division: null,
        completion_year: '',
        certificate_number: null,
        valid_from: null,
        valid_until: null,
        remarks: null
    });
    const [editingProfessionalIndex, setEditingProfessionalIndex] = useState<number | null>(null);

    // Add new state for all other components
    const [addresses, setAddresses] = useState<Address[]>(
        (employee.addresses || []).map(a => ({
            type: a.type,
            care_of: a.care_of,
            house_number: a.house_number,
            street: a.street,
            landmark: a.landmark,
            police_station: a.police_station,
            post_office: a.post_office,
            city: a.city,
            state: a.state,
            pin_code: a.pin_code,
            country: a.country,
            phone: a.phone,
            email: a.email,
            is_verified: a.is_verified
        }))
    );
    const [documents, setDocuments] = useState<Documents[]>(
        (employee.documents || []).map(d => ({
            document_type: d.document_type,
            document_number: d.document_number,
            document_path: d.document_path,
            document_file: null,
            issue_date: d.issue_date || '',
            expiry_date: d.expiry_date,
            issuing_authority: null,
            verification_status: d.verification_status,
            remarks: d.remarks
        }))
    );
    const [serviceDetails, setServiceDetails] = useState<ServiceDetailType[]>(
        (employee.service_details || []).map(s => ({
            designation: s.service_type,
            department: '',
            joining_date: s.service_start_date,
            employment_type: 'full-time',
            salary: '',
            reporting_to: '',
            work_location: s.service_location,
            employment_status: s.service_status === 'active' ? 'active' : 'terminated',
            notice_period: null,
            remarks: s.service_description
        }))
    );
    const [employmentDetails, setEmploymentDetails] = useState<EmploymentDetail[]>(
        (employee.joining_details || []).map(j => ({
            designation: j.designation,
            department: j.department,
            joining_date: j.joining_date,
            employment_type: j.employment_type === 'intern' ? 'internship' : j.employment_type as 'full-time' | 'part-time' | 'contract' | 'internship',
            salary: '',
            reporting_to: j.reporting_manager,
            work_location: '',
            employment_status: j.employment_status as 'active' | 'on-leave' | 'terminated',
            notice_period: j.notice_period ? String(j.notice_period) : null,
            remarks: null
        }))
    );
    const [documentIssued, setDocumentIssued] = useState<DocumentIssue[]>([]);
    const [spouses, setSpouses] = useState<Spouse[]>(
        (employee.spouses || []).map(s => ({
            spouse_name: s.name,
            spouse_dob: s.date_of_birth,
            spouse_telephone: s.contact_number,
            spouse_qualification: null,
            marriage_date: null,
            spouse_job_details: s.occupation,
            mother_tongue: null,
            religion: null
        }))
    );
    const [children, setChildren] = useState<Child[]>(
        (employee.children || []).map(c => ({
            name: c.name,
            date_of_birth: c.date_of_birth,
            gender: c.gender
        }))
    );
    const [nominees, setNominees] = useState<Nominee[]>(
        (employee.nominees || []).map(n => ({
            nominee_name: n.name,
            nominee_relationship: n.relationship as Nominee['nominee_relationship'],
            nominee_dob: null,
            share_percentage: null
        }))
    );
    const [references, setReferences] = useState<Reference[]>(
        (employee.references || []).map(r => ({
            reference_name: r.name,
            designation: r.designation,
            reference_address: r.organization
        }))
    );
    const [knownLanguages, setKnownLanguages] = useState<KnownLanguage[]>(
        (employee.known_languages || []).map(l => ({
            language_name: l.language,
            speak: l.proficiency === 'native' || l.proficiency === 'advanced',
            read: l.proficiency === 'native' || l.proficiency === 'advanced' || l.proficiency === 'intermediate',
            write: l.proficiency === 'native' || l.proficiency === 'advanced',
            priority: l.proficiency === 'native' ? 1 : l.proficiency === 'advanced' ? 2 : l.proficiency === 'intermediate' ? 3 : 4
        }))
    );
    const [specialTrainings, setSpecialTrainings] = useState<SpecialTraining[]>(
        (employee.special_trainings || []).map(t => ({
            training_name: t.training_name,
            training_place: t.institution,
            organized_by: t.institution,
            training_start_date: t.completion_date,
            training_end_date: t.completion_date
        }))
    );
    const [curricularActivities, setCurricularActivities] = useState<CurricularActivity[]>(
        (employee.curricular_activities || []).map(a => ({
            event_name: a.activity_name,
            discipline: '',
            prize_awarded: '',
            event_year: ''
        }))
    );

    const form = useForm<EmployeeProfile>({
        initialValues: {
            first_name: employee.first_name,
            last_name: employee.last_name || null,
            pf_no: employee.pf_no || null,
            date_of_birth: employee.date_of_birth || null,
            gender: employee.gender || 'male',
            blood_group: employee.blood_group || null,
            pan_no: employee.pan_no || null,
            aadhar_no: employee.aadhar_no || null,
            guardian_name: employee.guardian_name || null,
            contact_no: employee.contact_no || null,
            email: employee.email || null,
            country: employee.country || null,
        },
        validate: {
            email: (value) => value ? (/^\S+@\S+$/.test(value) ? null : 'Invalid email') : null,
            contact_no: (value) => value ? (value.length >= 10 ? null : 'Contact number must be at least 10 digits') : null,
        },
    });

    const validateRequiredFields = (data: EducationalQualification | ProfessionalQualification, requiredFields: (keyof EducationalQualification | keyof ProfessionalQualification)[]): boolean => {
        return requiredFields.every(field => {
            const value = 'qualification_type' in data 
                ? data[field as keyof EducationalQualification]
                : data[field as keyof ProfessionalQualification];
            return value !== undefined && value !== null && String(value).trim() !== '';
        });
    };

    const resetEducationalForm = () => {
        setEducationalInput({
            qualification_type: '',
            institution: '',
            board_university: '',
            year_of_passing: '',
            marks_percentage: '',
            grade: '',
            specialization: null,
            medium: '',
            subject: ''
        });
        setEditingEducationalIndex(null);
    };

    const resetProfessionalForm = () => {
        setProfessionalInput({
            exam_name: '',
            institution: '',
            division: null,
            completion_year: '',
            certificate_number: null,
            valid_from: null,
            valid_until: null,
            remarks: null
        });
        setEditingProfessionalIndex(null);
    };

    const handleAddEducational = () => {
        if (!validateRequiredFields(educationalInput, REQUIRED_EDUCATIONAL_FIELDS)) {
            return;
        }

        if (editingEducationalIndex !== null) {
            const updatedList = [...educationalList];
            updatedList[editingEducationalIndex] = educationalInput;
            setEducationalList(updatedList);
        } else {
            setEducationalList([...educationalList, educationalInput]);
        }
        resetEducationalForm();
    };

    const handleAddProfessional = () => {
        if (!validateRequiredFields(professionalInput, REQUIRED_PROFESSIONAL_FIELDS)) {
            return;
        }

        if (editingProfessionalIndex !== null) {
            const updatedList = [...professionalList];
            updatedList[editingProfessionalIndex] = professionalInput;
            setProfessionalList(updatedList);
        } else {
            setProfessionalList([...professionalList, professionalInput]);
        }
        resetProfessionalForm();
    };

    const handleEditEducational = (index: number) => {
        setEditingEducationalIndex(index);
        setEducationalInput(educationalList[index]);
    };

    const handleEditProfessional = (index: number) => {
        setEditingProfessionalIndex(index);
        setProfessionalInput(professionalList[index]);
    };

    const handleDeleteEducational = (index: number) => {
        const updatedList = educationalList.filter((_, i) => i !== index);
        setEducationalList(updatedList);
        resetEducationalForm();
    };

    const handleDeleteProfessional = (index: number) => {
        const updatedList = professionalList.filter((_, i) => i !== index);
        setProfessionalList(updatedList);
        resetProfessionalForm();
    };

    const handleSubmit = async (values: Record<string, any>) => {
        try {
            setIsSubmitting(true);
            const formData = new FormData();
            formData.append('_method', 'PUT');

            // Append basic profile
            Object.entries(values).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    formData.append(key, String(value));
                }
            });

            // Append all related data
            const appendData = (data: any[], prefix: string) => {
                data.forEach((item, idx) => {
                    Object.entries(item).forEach(([key, value]) => {
                        if (value !== null && value !== undefined) {
                            if (value instanceof File) {
                                formData.append(`${prefix}[${idx}][${key}]`, value);
                            } else {
                                formData.append(`${prefix}[${idx}][${key}]`, String(value));
                            }
                        }
                    });
                });
            };

            appendData(educationalList, 'educational_qualifications');
            appendData(professionalList, 'professional_qualifications');
            appendData(addresses, 'addresses');
            appendData(documents, 'documents');
            appendData(serviceDetails, 'service_details');
            appendData(employmentDetails, 'joining_details');
            appendData(documentIssued, 'document_issued');
            appendData(children, 'children');
            appendData(spouses, 'spouses');
            appendData(nominees, 'nominees');
            appendData(references, 'references');
            appendData(knownLanguages, 'known_languages');
            appendData(specialTrainings, 'special_trainings');
            appendData(curricularActivities, 'curricular_activities');

            const response = await axios.post(`/api/employees/${employee.id}`, formData);
            onUpdate(response.data);
            onClose();
            notifications.show({
                title: 'Success',
                message: 'Employee updated successfully',
                color: 'green'
            });
        } catch (error) {
            console.error('Error updating employee:', error);
            notifications.show({
                title: 'Error',
                message: 'Failed to update employee',
                color: 'red'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFormSubmit = () => {
        if (formRef.current) {
            formRef.current.requestSubmit();
        }
    };

    const handleDocumentChange = (newDocuments: Documents[]) => {
        setDocuments(newDocuments);
    };

    const handleServiceChange = (newServiceDetails: ServiceDetailType[]) => {
        setServiceDetails(newServiceDetails);
    };

    const handleEmploymentChange = (newEmploymentDetails: EmploymentDetail[]) => {
        setEmploymentDetails(newEmploymentDetails);
    };

    return (
        <Modal opened={true} onClose={onClose} size="100%" title="Edit Employee">
            <Tabs value={activeTab} onChange={setActiveTab}>
                <Tabs.List>
                    <Tabs.Tab value="basic_profile">Basic Profile</Tabs.Tab>
                    <Tabs.Tab value="qualification_details">Qualification Details</Tabs.Tab>
                    <Tabs.Tab value="address_details">Address Details</Tabs.Tab>
                    <Tabs.Tab value="document_details">Document Details</Tabs.Tab>
                    <Tabs.Tab value="service_details">Service Details</Tabs.Tab>
                    <Tabs.Tab value="employment_details">Employment Details</Tabs.Tab>
                    <Tabs.Tab value="document_issued">Document Issued</Tabs.Tab>
                    <Tabs.Tab value="other_details">Other Details</Tabs.Tab>
                </Tabs.List>

                <form ref={formRef} onSubmit={form.onSubmit(handleSubmit)}>
                    <Tabs.Panel value="basic_profile">
                        <div className="grid grid-cols-4 gap-4">
                            <TextInput
                                label="First Name"
                                required
                                {...form.getInputProps('first_name')}
                            />
                            <TextInput
                                label="Last Name"
                                {...form.getInputProps('last_name')}
                            />
                            <TextInput
                                label="PF Number"
                                {...form.getInputProps('pf_no')}
                            />
                            <TextInput
                                label="Date of Birth"
                                type="date"
                                {...form.getInputProps('date_of_birth')}
                            />
                            <Select
                                label="Gender"
                                required
                                data={[
                                    { value: 'male', label: 'Male' },
                                    { value: 'female', label: 'Female' },
                                    { value: 'other', label: 'Other' },
                                ]}
                                {...form.getInputProps('gender')}
                            />
                            <Select
                                label="Blood Group"
                                data={[
                                    { value: 'A+', label: 'A+' },
                                    { value: 'A-', label: 'A-' },
                                    { value: 'B+', label: 'B+' },
                                    { value: 'B-', label: 'B-' },
                                    { value: 'AB+', label: 'AB+' },
                                    { value: 'AB-', label: 'AB-' },
                                    { value: 'O+', label: 'O+' },
                                    { value: 'O-', label: 'O-' },
                                ]}
                                {...form.getInputProps('blood_group')}
                            />
                            <TextInput
                                label="PAN Number"
                                {...form.getInputProps('pan_no')}
                            />
                            <TextInput
                                label="Aadhar Number"
                                {...form.getInputProps('aadhar_no')}
                            />
                            <TextInput
                                label="Guardian Name"
                                {...form.getInputProps('guardian_name')}
                            />
                            <TextInput
                                label="Contact Number"
                                {...form.getInputProps('contact_no')}
                            />
                            <TextInput
                                label="Email"
                                type="email"
                                {...form.getInputProps('email')}
                            />
                            <TextInput
                                label="Country"
                                {...form.getInputProps('country')}
                            />
                        </div>
                    </Tabs.Panel>

                    <Tabs.Panel value="qualification_details">
                        <EducationalDetails
                            educationalList={educationalList}
                            educationalInput={educationalInput}
                            editingEducationalIndex={editingEducationalIndex}
                            onEducationalInputChange={setEducationalInput}
                            onAddEducational={handleAddEducational}
                            onResetEducationalForm={resetEducationalForm}
                            onEditEducational={handleEditEducational}
                            onDeleteEducational={handleDeleteEducational}
                            validateRequiredFields={validateRequiredFields}
                            requiredFields={REQUIRED_EDUCATIONAL_FIELDS}
                        />
                        <hr className="my-4" />
                        <ProfessionalDetails
                            professionalList={professionalList}
                            professionalInput={professionalInput}
                            editingProfessionalIndex={editingProfessionalIndex}
                            onProfessionalInputChange={setProfessionalInput}
                            onAddProfessional={() => handleAddProfessional()}
                            onResetProfessionalForm={resetProfessionalForm}
                            onEditProfessional={handleEditProfessional}
                            onDeleteProfessional={handleDeleteProfessional}
                            validateRequiredFields={(data: ProfessionalQualification, fields: (keyof ProfessionalQualification)[]) => 
                                validateRequiredFields(data, fields)}
                            requiredFields={REQUIRED_PROFESSIONAL_FIELDS}
                        />
                    </Tabs.Panel>

                    <Tabs.Panel value="address_details">
                        <AddressDetails
                            addresses={addresses}
                            onAddressesChange={setAddresses}
                        />
                    </Tabs.Panel>

                    <Tabs.Panel value="document_details">
                        <DocumentSubmitted
                            documents={documents}
                            onDocumentsChange={handleDocumentChange}
                        />
                    </Tabs.Panel>

                    <Tabs.Panel value="service_details">
                        <ServiceDetail
                            serviceDetails={serviceDetails}
                            onServiceDetailsChange={handleServiceChange}
                        />
                    </Tabs.Panel>

                    <Tabs.Panel value="employment_details">
                        <EmploymentDetails
                            serviceDetails={employmentDetails}
                            onServiceDetailsChange={handleEmploymentChange}
                        />
                    </Tabs.Panel>

                    <Tabs.Panel value="document_issued">
                        <DocumentIssued
                            documents={documentIssued}
                            onDocumentsChange={setDocumentIssued}
                        />
                    </Tabs.Panel>

                    <Tabs.Panel value="other_details">
                        <OtherDetails
                            spouses={spouses}
                            onSpousesChange={setSpouses}
                            children={children}
                            onChildrenChange={setChildren}
                            nominees={nominees}
                            onNomineesChange={setNominees}
                            references={references}
                            onReferencesChange={setReferences}
                            knownLanguages={knownLanguages}
                            onKnownLanguagesChange={setKnownLanguages}
                            specialTrainings={specialTrainings}
                            onSpecialTrainingsChange={setSpecialTrainings}
                            curricularActivities={curricularActivities}
                            onCurricularActivitiesChange={setCurricularActivities}
                        />
                    </Tabs.Panel>
                </form>
            </Tabs>

            <Group justify="flex-end" mt="md">
                <Button variant="light" onClick={onClose}>
                    Cancel
                </Button>
                <Button onClick={handleFormSubmit} loading={isSubmitting}>
                    Save Changes
                </Button>
            </Group>
        </Modal>
    );
};

export default EditEmployee; 