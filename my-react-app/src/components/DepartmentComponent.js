import React, {useEffect, useState } from 'react';
import { useNavigate,useParams } from 'react-router-dom';
import DepartmentService from '../services/DepartmentService';

const DepartmentComponent = () => {

    const [departmentName, setDepartmentName] = useState('');
    const [departmentDescription, setDepartmentDescription] = useState('');
    const [errors, setErrors] = useState({});

    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        if (id) {
            DepartmentService.getDepartmentById(id) 
                .then((response) => {
                    let department = response.data;
                    setDepartmentName(department.departmentName);
                    setDepartmentDescription(department.departmentDescription);
                }).catch((error) => {
                    console.log("Something went wrong", error);
                });
        }   
    }, [id]);

    const validateForm = () => {
        const newErrors = {};
        if (!departmentName.trim()) {
            newErrors.departmentName = 'Department name is required';
        } else if (departmentName.length < 3) {
            newErrors.departmentName = 'Department name must be at least 3 characters';
        }

        if (!departmentDescription.trim()) {
            newErrors.departmentDescription = 'Description is required';
        } else if (departmentDescription.length < 5) {
            newErrors.departmentDescription = 'Description must be at least 5 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const saveOrUpdateDepartment = (e) => {
        e.preventDefault();
        if (!validateForm()) return; // stop if form invalid
        const department = { departmentName, departmentDescription };
        console.log(department);

        if(id) {
            DepartmentService.updateDepartment(id, department)
            .then((response) => {
                console.log("Department data updated successfully", response.data); 
                navigate('/departments');
            })
            .catch((error) => {
                console.log("Something went wrong", error);
            }); 
             return;
        }else {

            DepartmentService.createDepartment(department)
            .then((response) => {
                console.log("Department data saved successfully", response.data);
                navigate('/departments');
            })
            .catch((error) => {
                console.log("Something went wrong", error);
            });
        }
        
    }

      function pageTitle() {
        if (id) {
            return <h2 className='text-center'>Update Department</h2>
        }
        else {
            return <h2 className='text-center'>Add Department</h2>
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
                                <label className='form-label'>Department Name:</label>
                                <input type="text" placeholder='Enter Department Name' className={`form-control ${errors.departmentName ? 'is-invalid' : ''}`}
                                    value={departmentName} onChange={(e) => setDepartmentName(e.target.value)} />
                                {errors.departmentName && (
                                    <div className="invalid-feedback">{errors.departmentName}</div>
                                )}
                            </div>
                            <div className='form-group mb-2'>
                                <label className='form-label'>Department Description:</label>
                                <input type="text" placeholder='Enter Department Description' className={`form-control ${errors.departmentDescription ? 'is-invalid' : ''}`}
                                    value={departmentDescription} onChange={(e) => setDepartmentDescription(e.target.value)} />
                                {errors.departmentDescription && (
                                    <div className="invalid-feedback">{errors.departmentDescription}</div>
                                )}
                            </div>
                            <button className='btn btn-success' type='submit' onClick={saveOrUpdateDepartment}>Submit</button>
                        </form>
                    </div>
                </div>

            </div>



        </div>
    )
}

export default DepartmentComponent