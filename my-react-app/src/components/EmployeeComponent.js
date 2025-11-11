import React, { use, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import EmployeeService from '../services/EmployeeService';
import DepartmentComponent from '../services/DepartmentService';

const EmployeeComponent = () => {
    const [firstName, setFirstName] = React.useState('');
    const [lastName, setLastName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [departmentId, setDepartmentId] = React.useState('');
    const [departments, setDepartments] = React.useState([]);

    useEffect(() => {
        DepartmentComponent.getDepartments()
            .then((response) => {
                setDepartments(response.data);
            })
            .catch((error) => {
                console.log("Something went wrong", error);
            }
            );
    }, []);

    const { id } = useParams();

    const [errors, setErrors] = useState({
        firstName: '',
        lastName: '',
        email: '',
        department: ''
    });

    const navigate = useNavigate();

    useEffect(() => {
        if (id) {
            EmployeeService.getEmployeeById(id)
                .then((response) => {
                    let employee = response.data;
                    setFirstName(employee.firstName);
                    setLastName(employee.lastName);
                    setEmail(employee.email);
                    setDepartmentId(employee.departmentId);
                }).catch((error) => {
                    console.log("Something went wrong", error);
                });
        }
    }, [id]);



    const handleFirstName = (e) => setFirstName(e.target.value);
    const handleLastName = (e) => setLastName(e.target.value);
    const handleEmail = (e) => setEmail(e.target.value);

    function saveOrUpdateEmployee(e) {
        e.preventDefault();
        if (validateForm()) {
            const employee = { firstName, lastName, email , departmentId};
            console.log(employee);

            if (id) {
                EmployeeService.updateEmployee(id, employee)
                    .then((response) => {
                        console.log("Employee data updated successfully", response.data);
                        navigate('/employees');
                    }).catch((error) => {
                        console.log("Something went wrong", error);
                    });
                return;
            }
            else {
                EmployeeService.createEmployee(employee)
                    .then((response) => {
                        console.log("Employee data saved successfully", response.data);
                        navigate('/employees');
                    }).catch((error) => {
                        console.log("Something went wrong", error);
                    });
            }


        }


    }

    function validateForm() {
        let isValid = true;
        const errorsCopy = { ...errors };

        if (!firstName.trim()) {
            errorsCopy.firstName = 'First Name is required';
            isValid = false;
        }
        if (!lastName.trim()) {
            errorsCopy.lastName = 'Last Name is required';
            isValid = false;
        }
        if (!email.trim()) {
            errorsCopy.email = 'Email is required';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            errorsCopy.email = 'Email is invalid';
            isValid = false;
        }
        if (!departmentId) {
            errorsCopy.department = 'Department selection is required';
            isValid = false;
        }   else {
            errorsCopy.department = '';
        }   
        
        setErrors(errorsCopy);
        return isValid;
    }

    function pageTitle() {
        if (id) {
            return <h2 className='text-center'>Update Employee</h2>
        }
        else {
            return <h2 className='text-center'>Add Employee</h2>
        }
    }

    return (
        <div className='container'>
            <br />
            <div className='row'>
                <div className='card col-md-6 offset-md-3 offset-md-3'>
                    {pageTitle()}
                    <div className='card-body'>
                        <form>
                            <div className='form-group mb-2'>
                                <label className='form-label'>First Name:</label>
                                <input type="text" placeholder='Enter Employee First Name' className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                                    value={firstName} onChange={handleFirstName} />
                                {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
                            </div>

                            <div className='form-group mb-2'>
                                <label className='form-label'>Last Name:</label>
                                <input type="text" placeholder='Enter Employee Last Name' className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                                    value={lastName} onChange={handleLastName} />
                                {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
                            </div>
                            <div className='form-group mb-2'>
                                <label className='form-label'>Email:</label>
                                <input type="text" placeholder='Enter Employee Email' className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                    value={email} onChange={handleEmail} />
                                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                            </div>

                            <div className='form-group mb-2'>
                                <label className='form-label'>Select Department:</label>
                                <select className={`form-control ${errors.department ? 'is-invalid' : ''}`} value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
                                    <option value=''>-- Select Department --</option>
                                    {
                                        departments.map((department) => (
                                            <option key={department.id} value={department.id}>{department.departmentName}</option>
                                        ))
                                    }
                                </select>
                                {errors.email && <div className="invalid-feedback">{errors.department}</div>}

                            </div>

                            <button className='btn btn-success' onClick={saveOrUpdateEmployee}>Save</button>

                        </form>


                    </div>
                </div>
            </div>
        </div>
    )
}

export default EmployeeComponent