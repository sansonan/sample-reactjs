import React, { useEffect, useState } from "react";
import ListEmpolyees from "../services/EmployeeService";
import{ useNavigate } from 'react-router-dom';

const ListEmployee = () => {
  const [employees, setEmployees] = useState([]);

  const navigate = useNavigate();

 useEffect(() => {
    getAllEmployees();
  }, []);

  function getAllEmployees() {
    ListEmpolyees.getEmployees()
      .then((response) => {   
        setEmployees(response.data);
        console.log(response.data);
      })
      .catch((error) => {
        console.log("Something went wrong", error);
      });   
  }

  function addNewEmployee() {
    navigate('/add-employee');
    
  }
  function updateEmployee(id) {
    navigate(`/edit-employee/${id}`);
  }
  function deleteEmployee(id) {
    ListEmpolyees.deleteEmployee(id)
      .then((response) => { 
        getAllEmployees();
        // setEmployees(employees.filter(employee => employee.id !== id));
      })
      .catch((error) => {
        console.log("Something went wrong", error);
      });   
  }

  return (
    <div className="container">
      <h1 className="text-center">List of Employees</h1>
      <button className="btn btn-primary mb-2" onClick={addNewEmployee}> Add Employee</button>
      <table className="table table-striped table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>firstName</th>
            <th>lastName</th>
             <th>Email</th>
             <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td>{employee.id}</td>
              <td>{employee.firstName}</td>
              <td>{employee.lastName}</td>
               <td>{employee.email}</td>
                <td>  
                  <button className="btn btn-info" onClick={() => updateEmployee(employee.id)}>Update</button>
                 <button style={{marginLeft:"10px"}} className="btn btn-danger" onClick={() => deleteEmployee(employee.id)}>Delete</button>
                 </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListEmployee;

