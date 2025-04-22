"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import CreatableSelect from "react-select/creatable";
import { useTranslation } from "react-i18next";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/firebase/config";

// Predefined Role Options
const roleOptions = [
  { value: "Supplier Admin", label: "Supplier Admin" },
  { value: "Product Manager", label: "Product Manager" },
  { value: "Order Manager", label: "Order Manager" },
  {
    value: "Customer Service Representative",
    label: "Customer Service Representative",
  },
  { value: "Inventory Coordinator", label: "Inventory Coordinator" },
];

export default function ManageEmployees({ supplierId: passedSupplierId }) {
  const { t } = useTranslation();
  const router = useRouter();

  const [employees, setEmployees] = useState([]);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    role: "",
    email: "",
    username: "",
    password: "",
  });
  const [editMode, setEditMode] = useState(null);
  const [supplierId, setSupplierId] = useState(passedSupplierId || null);

  // Fetch employees for this supplier
  const fetchEmployees = useCallback(async () => {
    if (!supplierId) {
      console.error(t("errors.missing_supplier_id"));
      return;
    }
    try {
      const q = query(
        collection(db, "employees"),
        where("supplierId", "==", supplierId)
      );
      const snap = await getDocs(q);
      setEmployees(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(t("errors.fetch_employees_error"), err);
    }
  }, [supplierId, t]);

  // If no supplierId passed in, grab it from the logged‑in user
  useEffect(() => {
    if (!passedSupplierId) {
      const unsub = onAuthStateChanged(auth, (user) => {
        if (user) {
          setSupplierId(user.uid);
        } else {
          console.error(t("errors.user_not_authenticated"));
          router.push("/user-login");
        }
      });
      return () => unsub();
    }
  }, [passedSupplierId, t, router]);

  // Fetch when supplierId becomes available
  useEffect(() => {
    if (supplierId) fetchEmployees();
  }, [supplierId, fetchEmployees]);

  const resetForm = () => {
    setNewEmployee({
      name: "",
      role: "",
      email: "",
      username: "",
      password: "",
    });
  };

  const addEmployee = async () => {
    if (!supplierId) return console.error(t("errors.missing_supplier_id"));
    // simple validation
    if (
      !newEmployee.name ||
      !newEmployee.role ||
      !newEmployee.email ||
      !newEmployee.username ||
      !newEmployee.password
    ) {
      return console.error(t("errors.all_fields_required"));
    }
    try {
      await addDoc(collection(db, "employees"), {
        ...newEmployee,
        supplierId,
      });
      console.log(t("employees.messages.added"));
      fetchEmployees();
      resetForm();
    } catch (err) {
      console.error(t("errors.add_employee_error"), err);
    }
  };

  const updateEmployee = async (id) => {
    try {
      await updateDoc(doc(db, "employees", id), newEmployee);
      console.log(t("employees.messages.updated"));
      fetchEmployees();
      resetForm();
      setEditMode(null);
    } catch (err) {
      console.error(t("errors.update_employee_error"), err);
    }
  };

  const deleteEmployee = async (id) => {
    try {
      await deleteDoc(doc(db, "employees", id));
      console.log(t("employees.messages.deleted"));
      fetchEmployees();
    } catch (err) {
      console.error(t("errors.delete_employee_error"), err);
    }
  };

  return (
    <div>
      <h4 className='text-success fw-bold'>{t("employees.manage")}</h4>
      <p>{t("employees.description")}</p>

      <h6 className='text-muted fw-bold mt-4'>
        {editMode ? t("employees.edit") : t("employees.add")}:
      </h6>
      <div className='row g-2'>
        <div className='col-md-6'>
          {/* Name */}
          <div className='mb-2'>
            <label className='form-label small'>
              {t("employees.fields.name")}
            </label>
            <input
              type='text'
              className='form-control form-control-sm'
              placeholder={t("employees.fields.enter_name")}
              value={newEmployee.name}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, name: e.target.value })
              }
            />
          </div>
          {/* Role */}
          <div className='mb-2'>
            <label className='form-label small'>
              {t("employees.fields.role")}
            </label>
            <CreatableSelect
              options={roleOptions}
              placeholder={t("employees.fields.select_or_create_role")}
              value={
                newEmployee.role
                  ? { value: newEmployee.role, label: newEmployee.role }
                  : null
              }
              onChange={(opt) =>
                setNewEmployee({ ...newEmployee, role: opt?.value || "" })
              }
            />
          </div>
        </div>

        <div className='col-md-6'>
          {/* Email */}
          <div className='mb-2'>
            <label className='form-label small'>
              {t("employees.fields.email")}
            </label>
            <input
              type='email'
              className='form-control form-control-sm'
              placeholder={t("employees.fields.enter_email")}
              value={newEmployee.email}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, email: e.target.value })
              }
            />
          </div>
          {/* Username */}
          <div className='mb-2'>
            <label className='form-label small'>
              {t("employees.fields.username")}
            </label>
            <input
              type='text'
              className='form-control form-control-sm'
              placeholder={t("employees.fields.enter_username")}
              value={newEmployee.username}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, username: e.target.value })
              }
            />
          </div>
          {/* Password */}
          <div className='mb-2'>
            <label className='form-label small'>
              {t("employees.fields.password")}
            </label>
            <input
              type='password'
              className='form-control form-control-sm'
              placeholder={t("employees.fields.enter_password")}
              value={newEmployee.password}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, password: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      <div className='mt-2'>
        <button
          className='btn btn-success btn-sm'
          onClick={() => (editMode ? updateEmployee(editMode) : addEmployee())}
        >
          {editMode ? t("employees.update") : t("employees.add")}
        </button>
      </div>

      <h5 className='mt-4'>{t("employees.current")}</h5>
      <table className='table table-striped table-hover'>
        <thead>
          <tr>
            <th>{t("employees.fields.name")}</th>
            <th>{t("employees.fields.role")}</th>
            <th>{t("employees.fields.email")}</th>
            <th>{t("employees.fields.username")}</th>
            <th>{t("employees.actions.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id}>
              <td>{emp.name}</td>
              <td>{emp.role}</td>
              <td>{emp.email}</td>
              <td>{emp.username}</td>
              <td>
                <button
                  className='btn btn-outline-primary btn-sm me-2'
                  onClick={() => {
                    setEditMode(emp.id);
                    setNewEmployee(emp);
                  }}
                >
                  {t("employees.actions.edit")}
                </button>
                <button
                  className='btn btn-outline-danger btn-sm'
                  onClick={() => deleteEmployee(emp.id)}
                >
                  {t("employees.actions.delete")}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
