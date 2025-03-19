import { useState, useEffect, useMemo } from 'react'
import { useTable, useGlobalFilter, useSortBy, usePagination } from "react-table"
import * as React from "react"
import './App.css'
import axios from "axios";

function App() {


  const [employees, setEmployees] = useState([]);
  const [employeeData, setEmployeeData] = useState({ name: "", manager: "", salary: "" });
  const [errMsg, setErrMsg] = useState("");
  const [showButton, setShowButton] = useState(false);
  const columns = React.useMemo(() => [
    { Header: "EmployeeId", accessor: "employeeId" },
    { Header: "Name", accessor: "name" },
    { Header: "Manager", accessor: "manager" },
    { Header: "Salary", accessor: "salary" },
    {
      Header: "Edit", id: "Edit", accessor: "edit",
      Cell: props => (<button className='editBtn' onClick={() => handleUpdate(props.cell.row.original)}>Edit</button>)
    },
    {
      Header: "Delete", id: "Delete", accessor: "delete",
      Cell: props => (<button className='deleteBtn' onClick={() => handleDelete(props.cell.row.original)}>Delete</button>)
    }
  ], []);

  const data = useMemo(() => employees, []);

  const { getTableProps, getTableBodyProps, headerGroups, page, prepareRow, state, setGlobalFilter, pageCount, nextPage, previousPage, canPreviousPage, canNextPage, gotoPage } = useTable({ columns, data: employees, initialState: { pageSize: 5 } }, useGlobalFilter, useSortBy, usePagination);



  const { globalFilter, pageIndex } = state;
  const getAllEmployees = () => {
    axios.get("http://localhost:8085/employees")
      .then((res) => {
        setEmployees(res.data);
      })
      .catch((err) => {
        console.error("Error fetching employees:", err);

      });
  }

  useEffect(() => {
    getAllEmployees();
  }, [])


  const handleChange = (e) => {
    setEmployeeData({ ...employeeData, [e.target.name]: e.target.value })
    setErrMsg("");
  }

  const clear = () => {
    setEmployeeData({ name: "", manager: "", salary: "" })
    getAllEmployees();
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    let errmsg = "";
    if (!employeeData.name || !employeeData.manager || !employeeData.salary) {
      errmsg = "All are must be filled";
      setErrMsg(errmsg)
    }
    if ((errmsg.length === 0) && employeeData.employeeId) {
      await axios.patch(`http://localhost:8085/employees/${employeeData.employeeId}`, employeeData)

    } else if (errmsg.length === 0) {
      await axios.post(`http://localhost:8085/employees`, employeeData)
    }

    clear();
  }

  const handleClick = () => {
    setEmployeeData({ name: "", manager: "", salary: "" });
    setShowButton(false);
  }

  const handleDelete = async (emp) => {

    const isConfirm = window.confirm("Are you sure delete ?");
    if (isConfirm) {
      await axios.delete(`http://localhost:8085/employees/${emp.employeeId}`)
        .then((res) => {
          setEmployees(res.data);
        });
      window.location.reload();
    }

  }

  const handleUpdate = (emp) => {
    setEmployeeData(emp);
    setShowButton(true);
  }



  return (
    <>
      <div className='main-container'>
        <h3>Full Stack Application Using React JS , Spring Boot & PostgreSQL</h3>
        {errMsg && <span className='error'>{errMsg}</span>}
        <div className='add-panel'>
          <div className='addpaneldiv'>
            <label htmlFor="name">Name</label><br />
            <input className='inputpanel' value={employeeData.name} onChange={handleChange} type="text" name='name' id='name' />
          </div>
          <div className='addpaneldiv'>
            <label htmlFor="manager">Manager</label><br />
            <input className='inputpanel' value={employeeData.manager} onChange={handleChange} type="text" name='manager' id='manager' />
          </div>
          <div className='addpaneldiv'>
            <label htmlFor="salary">Salary</label><br />
            <input className='inputpanel' value={employeeData.salary} onChange={handleChange} type="text" name='salary' id='salary' />
          </div>
          <button className='addbtn' onClick={handleSubmit}>{employeeData.employeeId ? "Update" : "Add"}</button>
          <button className='cancelbtn' disabled={!showButton} onClick={handleClick}>Cancel</button>
        </div>
        <input className='searchinput' type="search" value={globalFilter || ""} onChange={(e) => setGlobalFilter(e.target.value)} name="inputsearch" id="inputsearch" placeholder='search employee here' />
      </div>
      <table className='table' {...getTableProps()}>
        <thead>
          {headerGroups.map((hg) => (
            <tr {...hg.getHeaderGroupProps()} key={hg.id}>
              {hg.headers.map((column) => (
                <th {...column.getHeaderProps(column.getSortByToggleProps())} key={column.id}>{column.render("Header")}
                  {column.isSorted && <span>{column.isSortedDesc ? "↓" : "↑"}</span>}
                </th>

              ))}

            </tr>
          ))}

        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()} key={row.id}>
                {row.cells.map((cell) => (

                  <td td {...cell.getCellProps()} key={cell.id} > {cell.render("Cell")}</td>

                ))}

              </tr>
            )
          })}

        </tbody>
      </table >
      <div className='pagediv'>
        <button onClick={() => gotoPage(0)} disabled={!canPreviousPage} className='pagebtn' >FirstPage</button>
        <button disabled={!canPreviousPage} className='pagebtn' onClick={previousPage}>Prev</button>
        <span className='idx'> {pageIndex + 1} of {pageCount}</span>
        <button disabled={!canNextPage} className='pagebtn' onClick={nextPage}>Next</button>
        <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage} className='pagebtn'>Last</button>
      </div>
    </>
  )
}

export default App
