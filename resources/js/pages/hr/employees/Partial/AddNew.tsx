import React, { useState, useRef } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { Modal, Button, Tabs, Textarea, TextInput, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import axios from 'axios';
import OtherDetails from './OtherDetails';
import DocumentSubmitted from './Documents';
import type { Documents as DocumentSubmittedType } from './Documents';
import EmploymentDetails from './EmploymentDetails';
import type { EmploymentDetail } from './EmploymentDetails';

interface ServiceDetail {
   
    service_type: string;
    service_start_date: string;
    service_end_date: string | null;
    service_status: 'active' | 'completed' | 'terminated';
    service_location: string;
    service_description: string | null;
}

interface OtherDetail {
   
    blood_group: string;
    emergency_contact_name: string;
    emergency_contact_number: string;
    emergency_contact_relation: string;
    hobbies: string | null;
    achievements: string | null;
}

interface QualificationDetail {
   
    degree: string;
    institution: string;
    year_of_passing: string;
    grade: string;
    specialization: string | null;
    board: string | null;
}

interface EducationalQualification {
  qualification: string;
  year_of_passing: string;
  school_college: string;
  board_university: string;
  date_of_completion: string;
  subjects: string;
  medium: string;
  marks: string;
}

interface ProfessionalQualification {
  name_of_exam: string;
  university: string;
  division: string;
  year: string;
}

interface EmployeeForm {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  nationality: string;
  marital_status: string;
  contact_no: string;
  email: string;
  state: string;
  address: string;
}

// Define required fields for Educational Qualification
const REQUIRED_EDUCATIONAL_FIELDS: (keyof EducationalQualification)[] = ['qualification', 'year_of_passing', 'school_college', 'board_university'];

// Define required fields for Professional Qualification
const REQUIRED_PROFESSIONAL_FIELDS: (keyof ProfessionalQualification)[] = ['name_of_exam', 'university', 'division', 'year'];

const AddNew = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const [activeTab, setActiveTab] = useState<string | null>('basic_profile');
  const formRef = useRef<HTMLFormElement>(null);

  // State for subcomponent data
  const [educationalList, setEducationalList] = useState<EducationalQualification[]>([]);
  const [educationalInput, setEducationalInput] = useState<EducationalQualification>({
    qualification: '',
    year_of_passing: '',
    school_college: '',
    board_university: '',
    date_of_completion: '',
    subjects: '',
    medium: '',
    marks: '',
  });
  const [editingEducationalIndex, setEditingEducationalIndex] = useState<number | null>(null);

  const [professionalList, setProfessionalList] = useState<ProfessionalQualification[]>([]);
  const [professionalInput, setProfessionalInput] = useState<ProfessionalQualification>({
    name_of_exam: '',
    university: '',
    division: '',
    year: '',
  });
  const [editingProfessionalIndex, setEditingProfessionalIndex] = useState<number | null>(null);

  const [otherDetails, setOtherDetails] = useState<OtherDetail[]>([]);

  // Add new state for documents and employment details
  const [submittedDocuments, setSubmittedDocuments] = useState<DocumentSubmittedType[]>([]);
  const [employmentDetails, setEmploymentDetails] = useState<EmploymentDetail[]>([]);

  const validateRequiredFields = (data: EducationalQualification | ProfessionalQualification, requiredFields: (keyof EducationalQualification | keyof ProfessionalQualification)[]): boolean => {
    return requiredFields.every(field => {
      if ('qualification' in data) {
        // data is EducationalQualification
        return data[field as keyof EducationalQualification] !== undefined && data[field as keyof EducationalQualification] !== null && String(data[field as keyof EducationalQualification]).trim() !== '';
      } else {
        // data is ProfessionalQualification
        return data[field as keyof ProfessionalQualification] !== undefined && data[field as keyof ProfessionalQualification] !== null && String(data[field as keyof ProfessionalQualification]).trim() !== '';
      }
    });
  };

  const resetEducationalForm = () => {
    setEducationalInput({
      qualification: '',
      year_of_passing: '',
      school_college: '',
      board_university: '',
      date_of_completion: '',
      subjects: '',
      medium: '',
      marks: '',
    });
    setEditingEducationalIndex(null);
  };

  const resetProfessionalForm = () => {
    setProfessionalInput({
      name_of_exam: '',
      university: '',
      division: '',
      year: '',
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

  const form = useForm<EmployeeForm>({
    initialValues: {
      first_name: '',
      last_name: '',
      date_of_birth: '',
      nationality: '',
      marital_status: '',
      contact_no: '',
      email: '',
      state: '',
      address: '',
    },
    validateInputOnBlur: false,
    validateInputOnChange: false,
  });

  const handleSubmit = (values: EmployeeForm) => {
    try {
      const formData = new FormData();
      formData.append('first_name', values.first_name);
      formData.append('last_name', values.last_name);
      formData.append('date_of_birth', values.date_of_birth);
      formData.append('nationality', values.nationality);
      formData.append('marital_status', values.marital_status);
      formData.append('contact_no', values.contact_no);
      formData.append('email', values.email);
      formData.append('state', values.state);
      formData.append('address', values.address);

      // Append Educational Qualifications
      educationalList.forEach((item, idx) => {
        Object.entries(item).forEach(([key, value]) => {
          formData.append(`educational_qualifications[${idx}][${key}]`, value);
        });
      });
      // Append Professional Qualifications
      professionalList.forEach((item, idx) => {
        Object.entries(item).forEach(([key, value]) => {
          formData.append(`professional_qualifications[${idx}][${key}]`, value);
        });
      });

      // Append Other Details
      otherDetails.forEach((item, idx) => {
        Object.entries(item).forEach(([key, value]) => {
          if (value !== null) {
            formData.append(`other_details[${idx}][${key}]`, value);
          }
        });
      });

      // Append Submitted Documents
      submittedDocuments.forEach((item, idx) => {
        Object.entries(item).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            formData.append(`submitted_documents[${idx}][${key}]`, String(value));
          }
        });
      });


      // Append Employment Details
      employmentDetails.forEach((item, idx) => {
        Object.entries(item).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            formData.append(`employment_details[${idx}][${key}]`, String(value));
          }
        });
      });

      axios.post('/hr/employees', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
        .then(res => {
          notifications.show({
            title: 'Success',
            message: 'Employee added successfully',
            color: 'green',
          });
          close();
        })
        .catch(err => {
          notifications.show({
            title: 'Error',
            message: 'Failed to add employee',
            color: 'red',
          });
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

  return (
    <>
      <Button variant="outline" color="cyan" size="xs" radius="xs" onClick={open}>Add New</Button>
      <Modal
        opened={opened}
        onClose={close}
        size={'80%'}
        title="Add New Employee"
      >
        <form ref={formRef} onSubmit={form.onSubmit(handleSubmit)}>
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List justify="flex-end">
              <Tabs.Tab value="basic_profile">Basic Profile</Tabs.Tab>
              <Tabs.Tab value="qualification_details">Qualification Details</Tabs.Tab>
              <Tabs.Tab value="other_details">Other Details</Tabs.Tab>
              <Tabs.Tab value="employment_details">Employment Details</Tabs.Tab>
              <Tabs.Tab value="document_submitted">Documents</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="basic_profile">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <TextInput label="First Name" required {...form.getInputProps('first_name')} />
                  <TextInput label="Last Name" required {...form.getInputProps('last_name')} />
                  <TextInput label="Date of Birth" type="date" required {...form.getInputProps('date_of_birth')} />
                  <TextInput label="Nationality" required {...form.getInputProps('nationality')} />
                  <TextInput label="Marital Status" required {...form.getInputProps('marital_status')} />
                  <TextInput label="Contact No" required {...form.getInputProps('contact_no')} />
                  <TextInput label="Email" type="email" required {...form.getInputProps('email')} />
                  <TextInput label="State" {...form.getInputProps('state')} />
                </div>
                <Textarea label="Address" minRows={3} {...form.getInputProps('address')} />
              </div>
            </Tabs.Panel>

            <Tabs.Panel value="qualification_details">
              {/* Educational Details */}
              <div className="border p-4 rounded mb-4">
                <h4 className="font-semibold mb-2">Educational Details</h4>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  <TextInput label="Qualification" value={educationalInput.qualification} onChange={e => setEducationalInput({ ...educationalInput, qualification: e.target.value })} required />
                  <TextInput label="Year of Passing" value={educationalInput.year_of_passing} onChange={e => setEducationalInput({ ...educationalInput, year_of_passing: e.target.value })} type="number" required />
                  <TextInput label="School/College Name" value={educationalInput.school_college} onChange={e => setEducationalInput({ ...educationalInput, school_college: e.target.value })} required />
                  <TextInput label="Board/University" value={educationalInput.board_university} onChange={e => setEducationalInput({ ...educationalInput, board_university: e.target.value })} required />
                  <TextInput label="Date of Completion" value={educationalInput.date_of_completion} onChange={e => setEducationalInput({ ...educationalInput, date_of_completion: e.target.value })} type="date" />
                  <TextInput label="Subjects" value={educationalInput.subjects} onChange={e => setEducationalInput({ ...educationalInput, subjects: e.target.value })} />
                  <TextInput label="Medium" value={educationalInput.medium} onChange={e => setEducationalInput({ ...educationalInput, medium: e.target.value })} />
                  <TextInput label="Marks(%)" value={educationalInput.marks} onChange={e => setEducationalInput({ ...educationalInput, marks: e.target.value })} type="number" />
                </div>
                <Button type="button" onClick={handleAddEducational} className="mb-2" disabled={!validateRequiredFields(educationalInput, REQUIRED_EDUCATIONAL_FIELDS)}>
                  {editingEducationalIndex !== null ? 'Update' : 'Add'}
                </Button>
                <Button type="button" onClick={resetEducationalForm} className="mb-2 ml-2">Clear</Button>
                <table className="w-full text-xs border mt-2">
                  <thead>
                    <tr className="bg-gray-100">
                      <th>Qualification</th>
                      <th>Year</th>
                      <th>School/College</th>
                      <th>University/Board</th>
                      <th>Date of Completion</th>
                      <th>Subject</th>
                      <th>Medium</th>
                      <th>Mark(%)</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {educationalList.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.qualification}</td>
                        <td>{item.year_of_passing}</td>
                        <td>{item.school_college}</td>
                        <td>{item.board_university}</td>
                        <td>{item.date_of_completion}</td>
                        <td>{item.subjects}</td>
                        <td>{item.medium}</td>
                        <td>{item.marks}</td>
                        <td>
                          <Button size="xs" variant="subtle" color="blue" onClick={() => handleEditEducational(idx)}>Edit</Button>
                          <Button size="xs" variant="subtle" color="red" onClick={() => handleDeleteEducational(idx)}>Delete</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Professional Qualification Details */}
              <div className="border p-4 rounded">
                <h4 className="font-semibold mb-2">Professional Qualification Details</h4>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  <TextInput label="Name of Examination" value={professionalInput.name_of_exam} onChange={e => setProfessionalInput({ ...professionalInput, name_of_exam: e.target.value })} required />
                  <TextInput label="University/Institution" value={professionalInput.university} onChange={e => setProfessionalInput({ ...professionalInput, university: e.target.value })} required />
                  <TextInput label="Division" value={professionalInput.division} onChange={e => setProfessionalInput({ ...professionalInput, division: e.target.value })} required />
                  <TextInput label="Year" value={professionalInput.year} onChange={e => setProfessionalInput({ ...professionalInput, year: e.target.value })} type="number" required />
                </div>
                <Button type="button" onClick={handleAddProfessional} className="mb-2" disabled={!validateRequiredFields(professionalInput, REQUIRED_PROFESSIONAL_FIELDS)}>
                  {editingProfessionalIndex !== null ? 'Update' : 'Add'}
                </Button>
                <Button type="button" onClick={resetProfessionalForm} className="mb-2 ml-2">Clear</Button>
                <table className="w-full text-xs border mt-2">
                  <thead>
                    <tr className="bg-gray-100">
                      <th>SN</th>
                      <th>Name of Examination</th>
                      <th>University/Institution</th>
                      <th>Division</th>
                      <th>Year</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {professionalList.map((item, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>{item.name_of_exam}</td>
                        <td>{item.university}</td>
                        <td>{item.division}</td>
                        <td>{item.year}</td>
                        <td>
                          <Button size="xs" variant="subtle" color="blue" onClick={() => handleEditProfessional(idx)}>Edit</Button>
                          <Button size="xs" variant="subtle" color="red" onClick={() => handleDeleteProfessional(idx)}>Delete</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Tabs.Panel>

            <Tabs.Panel value="other_details">
              <OtherDetails
                otherDetails={otherDetails}
                onOtherDetailsChange={setOtherDetails}
              />
            </Tabs.Panel>

            <Tabs.Panel value="employment_details">
              <EmploymentDetails
                employmentDetails={employmentDetails}
                onEmploymentDetailsChange={setEmploymentDetails}
              />
            </Tabs.Panel>

            <Tabs.Panel value="document_submitted">
              <DocumentSubmitted
                documents={submittedDocuments}
                onDocumentsChange={setSubmittedDocuments}
              />
            </Tabs.Panel>
          </Tabs>
          <Group justify="flex-end" mt="xl">
            <Button variant="outline" onClick={close} type="button">Cancel</Button>
            <Button type="submit">Save Employee</Button>
          </Group>
        </form>
      </Modal>
    </>
  );
};

export default AddNew; 