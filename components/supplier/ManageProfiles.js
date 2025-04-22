"use client";

import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { auth, db } from "@/firebase/config";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";

export default function ManageProfiles() {
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    companyDescription: "",
    address: "",
    crNumber: "",
    vatNumber: "",
    logoUrl: "",
    bankDetails: [],
  });

  const storage = getStorage();

  // load profile
  useEffect(() => {
    if (!currentUser) {
      setError(t("manage_profiles.errors.no_user_logged_in"));
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const userRef = doc(db, "users", currentUser.uid);
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
          setError(t("manage_profiles.errors.no_profile_found"));
        } else {
          const data = snap.data();
          setProfile({ id: snap.id, ...data });
          setFormData({
            name: data.name || "",
            email: data.email || "",
            role: data.role || "",
            companyDescription: data.companyDescription || "",
            address: data.address || "",
            crNumber: data.crNumber || "",
            vatNumber: data.vatNumber || "",
            logoUrl: data.logoUrl || "",
            bankDetails: Array.isArray(data.bankDetails)
              ? data.bankDetails
              : [],
          });
        }
      } catch (err) {
        console.error(err);
        setError(t("manage_profiles.errors.failed_to_load_profile"));
      } finally {
        setLoading(false);
      }
    })();
  }, [currentUser, t]);

  // handle field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  // upload a new logo
  const handleLogoUpload = (file) => {
    if (!file) return;
    setUploading(true);
    const storageRef = ref(storage, `logos/${currentUser.uid}/${file.name}`);
    const task = uploadBytesResumable(storageRef, file);
    task.on(
      "state_changed",
      () => {},
      (err) => {
        console.error(err);
        setUploading(false);
      },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        setFormData((f) => ({ ...f, logoUrl: url }));
        setUploading(false);
        alert(t("manage_profiles.messages.logo_uploaded_success"));
      }
    );
  };

  // add / remove bank rows
  const addBank = () =>
    setFormData((f) => ({
      ...f,
      bankDetails: [
        ...f.bankDetails,
        { bankName: "", accountName: "", accountNumber: "" },
      ],
    }));
  const removeBank = (i) =>
    setFormData((f) => ({
      ...f,
      bankDetails: f.bankDetails.filter((_, idx) => idx !== i),
    }));
  const handleBankChange = (e, i, field) => {
    const arr = [...formData.bankDetails];
    arr[i][field] = e.target.value;
    setFormData((f) => ({ ...f, bankDetails: arr }));
  };
  const handleBankFile = (file, i) => {
    if (!file) return;
    setUploading(true);
    const storageRef = ref(
      storage,
      `bank_details/${currentUser.uid}/${file.name}`
    );
    const task = uploadBytesResumable(storageRef, file);
    task.on(
      "state_changed",
      () => {},
      (err) => {
        console.error(err);
        setUploading(false);
      },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        const arr = [...formData.bankDetails];
        arr[i].fileUrl = url;
        setFormData((f) => ({ ...f, bankDetails: arr }));
        setUploading(false);
        alert(t("manage_profiles.messages.file_uploaded_success"));
      }
    );
  };

  // save back to Firestore
  const handleSave = async () => {
    setUploading(true);
    try {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        ...formData,
        bankDetails: formData.bankDetails || [],
      });
      setProfile((p) => ({ ...p, ...formData }));
      setIsEditing(false);
      alert(t("manage_profiles.messages.profile_updated_success"));
    } catch (err) {
      console.error(err);
      setError(t("manage_profiles.errors.failed_to_update_profile"));
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <p>{t("manage_profiles.messages.loading")}</p>;
  if (error) return <p className='text-danger'>{error}</p>;

  return (
    <div>
      <h4 className='text-success fw-bold'>{t("manage_profiles.title")}</h4>
      {isEditing ? (
        <div>
          {/* Basic fields */}
          {["name", "email", "role", "address", "crNumber", "vatNumber"].map(
            (field) => (
              <div key={field}>
                <label>
                  <strong>{t(`manage_profiles.fields.${field}`)}:</strong>
                  <input
                    type={field === "email" ? "email" : "text"}
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                  />
                </label>
              </div>
            )
          )}

          {/* Company description */}
          <div>
            <label>
              <strong>
                {t("manage_profiles.fields.company_description")}:
              </strong>
              <textarea
                name='companyDescription'
                value={formData.companyDescription}
                onChange={handleChange}
                rows={3}
              />
            </label>
          </div>

          {/* Logo upload */}
          <div>
            {formData.logoUrl && (
              <img
                src={formData.logoUrl}
                alt='logo'
                style={{ maxWidth: 150 }}
              />
            )}
            <input
              type='file'
              accept='image/*'
              onChange={(e) => handleLogoUpload(e.target.files[0])}
            />
          </div>

          {/* Bank details */}
          <div>
            <h5>{t("manage_profiles.fields.bank_details")}</h5>
            <table>
              <thead>
                <tr>
                  <th>{t("manage_profiles.fields.bankName")}</th>
                  <th>{t("manage_profiles.fields.accountName")}</th>
                  <th>{t("manage_profiles.fields.accountNumber")}</th>
                  <th>{t("manage_profiles.fields.fileUrl")}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {formData.bankDetails.map((b, i) => (
                  <tr key={i}>
                    <td>
                      <input
                        value={b.bankName}
                        onChange={(e) => handleBankChange(e, i, "bankName")}
                      />
                    </td>
                    <td>
                      <input
                        value={b.accountName}
                        onChange={(e) => handleBankChange(e, i, "accountName")}
                      />
                    </td>
                    <td>
                      <input
                        value={b.accountNumber}
                        onChange={(e) =>
                          handleBankChange(e, i, "accountNumber")
                        }
                      />
                    </td>
                    <td>
                      <input
                        type='file'
                        accept='application/pdf'
                        onChange={(e) => handleBankFile(e.target.files[0], i)}
                      />
                      {b.fileUrl && (
                        <a
                          href={b.fileUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                        >
                          View
                        </a>
                      )}
                    </td>
                    <td>
                      <button onClick={() => removeBank(i)}>—</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={addBank}>
              {t("manage_profiles.actions.add_bank")}
            </button>
          </div>

          <button onClick={handleSave} disabled={uploading}>
            {t("manage_profiles.actions.save")}
          </button>
          <button onClick={() => setIsEditing(false)}>
            {t("manage_profiles.actions.cancel")}
          </button>
        </div>
      ) : (
        <div>
          <p>
            <strong>{t("manage_profiles.fields.name")}:</strong> {profile.name}
          </p>
          <p>
            <strong>{t("manage_profiles.fields.email")}:</strong>{" "}
            {profile.email}
          </p>
          <p>
            <strong>{t("manage_profiles.fields.role")}:</strong> {profile.role}
          </p>
          <p>
            <strong>{t("manage_profiles.fields.address")}:</strong>{" "}
            {profile.address}
          </p>
          <p>
            <strong>{t("manage_profiles.fields.crNumber")}:</strong>{" "}
            {profile.crNumber}
          </p>
          <p>
            <strong>{t("manage_profiles.fields.vatNumber")}:</strong>{" "}
            {profile.vatNumber}
          </p>
          <p>
            <strong>{t("manage_profiles.fields.company_description")}:</strong>{" "}
            {profile.companyDescription}
          </p>
          {profile.logoUrl && (
            <div>
              <strong>{t("manage_profiles.fields.logo")}:</strong>
              <br />
              <img src={profile.logoUrl} alt='logo' style={{ maxWidth: 150 }} />
            </div>
          )}
          <div>
            <h5>{t("manage_profiles.fields.bank_details")}</h5>
            {profile.bankDetails?.length ? (
              <ul>
                {profile.bankDetails.map((b, i) => (
                  <li key={i}>
                    {b.bankName} / {b.accountName} / {b.accountNumber}{" "}
                    {b.fileUrl && (
                      <a
                        href={b.fileUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        [PDF]
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>{t("manage_profiles.messages.no_bank_details")}</p>
            )}
          </div>
          <button onClick={() => setIsEditing(true)}>
            {t("manage_profiles.actions.edit")}
          </button>
        </div>
      )}
    </div>
  );
}
