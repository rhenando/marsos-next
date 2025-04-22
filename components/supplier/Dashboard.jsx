"use client";

import React, { useState } from "react";
import * as Icons from "react-feather";
import { useAuth } from "@/context/AuthContext";
import ManageProfiles from "@/components/supplier/ManageProfiles";
import ManageEmployees from "@/components/supplier/ManageEmployees";
import Products from "@/components/supplier/SupplierProducts";
import SupplierRFQs from "@/components/supplier/SupplierRFQs";
import ManageTerms from "@/components/supplier/ManageTerms";
import SupplierOrdersPage from "@/components/supplier/SupplierOrdersPage";
import UserMessages from "@/components/global/UserMessages";
import { useTranslation } from "react-i18next";

const pascalCase = (str) =>
  str
    .split(/[\s-_]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [isSidebarVisible, setSidebarVisible] = useState(true);
  const [selectedMenu, setSelectedMenu] = useState("home");
  const { t } = useTranslation();

  const toggleSidebar = () => setSidebarVisible((v) => !v);

  const menuItems = [
    "home",
    "profiles",
    "terms",
    "employees",
    "messages",
    "products",
    "orders",
    "rfqs",
    "settings",
    "support",
  ];

  const renderIcon = (name) => {
    const IconComponent = Icons[pascalCase(name)];
    return IconComponent ? <IconComponent /> : null;
  };

  const handleMenuClick = (menu) => {
    setSelectedMenu(menu);
    setSidebarVisible(false);
  };

  const renderContent = () => {
    switch (selectedMenu) {
      case "home":
        return (
          <>
            <h4>
              {t("dashboard.welcome", { name: currentUser?.name || "User" })}
            </h4>
            <p>{t("dashboard.description")}</p>
          </>
        );
      case "profiles":
        return <ManageProfiles />;
      case "terms":
        return <ManageTerms />;
      case "employees":
        return <ManageEmployees />;
      case "messages":
        return <UserMessages />;
      case "products":
        return <Products />;
      case "orders":
        return <SupplierOrdersPage />;
      case "rfqs":
        return <SupplierRFQs />;
      case "settings":
        return (
          <>
            <h4>{t("dashboard.settings")}</h4>
            <p>{t("dashboard.settings_description")}</p>
          </>
        );
      case "support":
        return (
          <>
            <h4>{t("dashboard.support")}</h4>
            <p>{t("dashboard.support_description")}</p>
          </>
        );
      default:
        return <h1>{t("dashboard.default_message")}</h1>;
    }
  };

  return (
    <div className='container-fluid'>
      <nav
        className='row'
        style={{
          backgroundColor: "transparent",
          borderBottom: "1px solid #e0e0e0",
          padding: "10px 20px",
        }}
      >
        <div className='col-6 d-flex align-items-center'>
          <button
            onClick={toggleSidebar}
            style={{
              border: "none",
              background: "none",
              color: "#2c6449",
              cursor: "pointer",
            }}
          >
            {renderIcon("align-left")}
          </button>
          <h5 className='ms-2 mb-0'>{t("dashboard.title")}</h5>
        </div>
        <div className='col-6 d-flex justify-content-end align-items-center'>
          <img
            src={currentUser?.logoUrl || "https://via.placeholder.com/60"}
            alt='User Avatar'
            style={{ borderRadius: "50%", width: 60, height: 60 }}
          />
        </div>
      </nav>

      <div className='row'>
        {isSidebarVisible && (
          <aside
            className='col-md-2'
            style={{
              backgroundColor: "#f8f9fa",
              transition: "all 0.5s ease-in-out",
              transform: isSidebarVisible
                ? "translateY(0)"
                : "translateY(-20%)",
              opacity: isSidebarVisible ? 1 : 0,
              maxHeight: isSidebarVisible ? "100vh" : 0,
              overflow: "hidden",
              padding: isSidebarVisible ? "10px 20px" : 0,
            }}
          >
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {menuItems.map((menu) => (
                <li key={menu}>
                  <button
                    onClick={() => handleMenuClick(menu)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "10px 20px",
                      border: "none",
                      background: "none",
                      fontSize: 16,
                      color: selectedMenu === menu ? "#2c6449" : "inherit",
                      fontWeight: selectedMenu === menu ? "bold" : "normal",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      cursor: "pointer",
                    }}
                  >
                    {renderIcon(menu)}
                    {t(`menu.${menu}`)}
                  </button>
                </li>
              ))}
            </ul>
          </aside>
        )}

        <main className={isSidebarVisible ? "col-md-10" : "col-12"}>
          <div style={{ padding: 20 }}>{renderContent()}</div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
