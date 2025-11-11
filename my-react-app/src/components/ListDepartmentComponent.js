import React, { useEffect, useState } from 'react'
import DepartmentService from '../services/DepartmentService';
import { useNavigate } from 'react-router-dom';

import { Link } from 'react-router-dom';

function ListDepartmentComponent() {
    // let dummyDepartments = [
    //     {id:1, departmentName:'HR', departmentDescription:'New York'},
    //     {id:2, departmentName:'Finance', departmentDescription:'London'},
    //     {id:3, departmentName:'IT', departmentDescription:'San Francisco'},
    // ];  
    // const [departments, setDepartments] = useState(dummyDepartments);

    const [departmentList, setDepartmentList] = useState([]);
    const navigate = useNavigate();
    useEffect(() => {
        getAllDepartments();
    }, []);

    function getAllDepartments() {
        DepartmentService.getDepartments()
            .then((response) => {
                setDepartmentList(response.data);
                console.log(response.data);
            })
            .catch((error) => {
                console.log("Something went wrong", error);
            });
    }
    function updateDepartment(id) {
        navigate(`/edit-department/${id}`);
    }
    function deleteDepartment(id) {
        DepartmentService.deleteDepartment(id)
            .then((response) => {   
                getAllDepartments();
                // setDepartmentList(departmentList.filter(department => department.id !== id));
            })  
            .catch((error) => {
                console.log("Something went wrong", error);
            }   
            );
    }


    return (
        <div className='container'>
            <h2 className='text-center'>List of Departments</h2>
            <Link to='/add-department' className='btn btn-primary mb-2'> Add Department</Link>
            <table className='table table-striped table-bordered'>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Department Name</th>
                        <th>Department Description</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        departmentList.map(department =>
                            <tr key={department.id}>
                                <td>{department.id}</td>
                                <td>{department.departmentName}</td>
                                <td>{department.departmentDescription}</td>
                                <td>
                                    <button className="btn btn-info" onClick={() => updateDepartment(department.id)}>Update</button>
                                    <button style={{ marginLeft: "10px" }} className="btn btn-danger" onClick={() => deleteDepartment(department.id)}>Delete</button>
                                </td>
                            </tr>
                        )
                    }
                </tbody>
            </table>

        </div>
    )
}

export default ListDepartmentComponent