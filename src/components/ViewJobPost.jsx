import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

import Accordion from "react-bootstrap/Accordion";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import Table from "react-bootstrap/Table";
import Toast from "./Toast";
import Button from "react-bootstrap/Button";
import ModalBox from "./Modal";
import { BASE_URL } from "../config/backend_url";

function ViewJobPost() {
  document.title = "CPMS | View Job Post";
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  const { jobId } = useParams();
  const [editableApplicants, setEditableApplicants] = useState([]);
  const [editRow, setEditRow] = useState(null);

  const [data, setData] = useState({});
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  // useState for toast display
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // useState for load data
  const [currentUser, setCurrentUser] = useState({});

  // check applied to a job
  const [applied, setApplied] = useState(false);

  const [applicant, setApplicant] = useState([]);

  const exportApplicantsCSV = () => {
    if (!filteredApplicants.length) {
      alert("No applicants to export");
      return;
    }

    const headers = [
      "Name",
      "Roll No",
      "Year",
      "Email",
      "Applied At",
      "Current Round",
      "Round Result",
      "Job Status",
      "Interview Mode",
      "Interview Time",
      "Interview Link / Address",
    ];

    const rows = filteredApplicants.map((a) => [
      a.name,
      a.rollNo,
      a.year,
      a.email,
      a.appliedAt ? new Date(a.appliedAt).toLocaleString("en-IN") : "",
      a.currentRound || "",
      a.roundStatus || "",
      a.status || "",
      a.interviewMode || "",
      a.interviewTime ? new Date(a.interviewTime).toLocaleString("en-IN") : "",
      a.interviewLink || a.interviewAddress || "",
    ]);

    const csv =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows]
        .map((row) => row.map((val) => `"${val ?? ""}"`).join(","))
        .join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = `applicants_${jobId}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleInterviewChange = (index, field, value) => {
    const updated = [...editableApplicants];
    updated[index][field] = value;
    setEditableApplicants(updated);
  };
  // ✅ 1️⃣ highlightText FIRST
  const highlightText = (text) => {
    if (!searchTerm) return text;

    const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escaped})`, "gi");

    return String(text || "").replace(
      regex,
      `<mark style="background:#ffe58f; padding:0;">$1</mark>`,
    );
  };

  // ✅ 2️⃣ filteredApplicants AFTER
  const filteredApplicants = editableApplicants.filter((app) => {
    const rowText = `
    ${app.name || ""}
    ${app.rollNo || ""}
    ${app.year || ""}
    ${app.email || ""}
    ${app.resume || ""}
    ${app.appliedAt || ""}
    ${app.currentRound || ""}
    ${app.roundStatus || ""}
    ${app.status || ""}
    ${app.interviewMode || ""}
    ${app.interviewTime || ""}
    ${app.interviewLink || ""}
    ${app.interviewAddress || ""}
  `.toLowerCase();

    const matchesSearch = rowText.includes((searchTerm || "").toLowerCase());

    const matchesYear = !yearFilter || Number(app.year) === Number(yearFilter);

    const matchesStatus =
      !statusFilter ||
      (app.status || "").toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesYear && matchesStatus;
  });
  // ======================
  // 📊 STATUS PIE CHART DATA
  // ======================

  const appliedCount = filteredApplicants.filter(
    (a) => !a.status || a.status === "applied",
  ).length;

  const interviewCount = filteredApplicants.filter(
    (a) => a.status === "interview",
  ).length;

  const hiredCount = filteredApplicants.filter(
    (a) => a.status === "hired",
  ).length;

  const rejectedCount = filteredApplicants.filter(
    (a) => a.status === "rejected",
  ).length;

  const statusChartData = [
    { name: "Applied", value: appliedCount },
    { name: "Interview", value: interviewCount },
    { name: "Hired", value: hiredCount },
    { name: "Rejected", value: rejectedCount },
  ];

  const STATUS_COLORS = [
    "#facc15", // Applied - yellow
    "#60a5fa", // Interview - blue
    "#4ade80", // Hired - green
    "#f87171", // Rejected - red
  ];

  // check applied to a job
  const fetchApplied = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/student/check-applied/${jobId}/${currentUser.id}`,
      );

      if (response?.data?.applied) {
        setApplied(response.data.applied);
      }
    } catch (error) {
      if (error?.response?.data?.msg) {
        setToastMessage(error.response.data.msg);
        setShowToast(true);
      }
      console.log("error while fetching student applied or not => ", error);
    }
  };

  // checking for authentication
  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`${BASE_URL}/user/detail`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setCurrentUser({
          id: res.data.id,
          email: res.data.email,
          role: res.data.role,
        });
      })
      .catch((err) => {
        console.log("AddUserTable.jsx => ", err);
        setToastMessage(err);
        setShowToast(true);
      });
  }, []);

  const fetchJobDetail = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/tpo/job/${jobId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setData(response.data);
    } catch (error) {
      if (error.response) {
        if (error?.response.data?.msg) setToastMessage(error.response.data.msg);
        else setToastMessage(error.message);
        setShowToast(true);

        if (error?.response?.data?.msg === "job data not found")
          navigate("../404");
      }
      console.log("Error while fetching details => ", error);
    }
  };
  const deleteApplicant = async (appId) => {
    await axios.delete(`${BASE_URL}/tpo/interview/${jobId}/${appId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    fetchApplicant();
  };

  const fetchCompanyData = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/company/company-data?companyId=${data.company}`,
      );
      setCompany(response.data.company);
    } catch (error) {
      console.log("AddCompany error while fetching => ", error);
    }
  };

  // handle apply and its modal
  const [showModal, setShowModal] = useState(false);
  const [modalBody, setModalBody] = useState();

  const closeModal = () => {
    setShowModal(false);
  };

  const handleApply = () => {
    setModalBody(
      "Do you really want to apply this job? Make sure your profile is updated to lastest that increase placement chances.",
    );
    setShowModal(true);
    // console.log(currentUser)
  };

  const handleConfirmApply = async () => {
    try {
      const response = await axios.put(
        `${BASE_URL}/student/job/${jobId}/${currentUser.id}`,
      );
      // console.log(response.data);
      if (response?.data?.msg) {
        setToastMessage(response?.data?.msg);
        setShowToast(true);
      }
      setShowModal(false);
      fetchApplied();
      // setCompany(response.data.company);
    } catch (error) {
      setShowModal(false);
      if (error?.response?.data?.msg) {
        setToastMessage(error?.response?.data?.msg);
        setShowToast(true);
      }
      console.log("error while fetching apply to job => ", error);
    }
  };

  const fetchApplicant = async () => {
    if (!jobId || currentUser?.role === "student") return;
    await axios
      .get(`${BASE_URL}/tpo/job/applicants/${jobId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        if (res?.data?.msg) setToastMessage(res.data.msg);
        else setApplicant(res?.data?.applicantsList);
        setEditableApplicants(res?.data?.applicantsList);
      })
      .catch((err) => {
        console.log(err);
        if (err?.response?.data?.msg) setToastMessage(err.response.data.msg);
      });
  };
  const saveInterview = async (index) => {
    const app = editableApplicants[index]; // ✅ correct edited row

    try {
      await axios.post(
        `${BASE_URL}/tpo/interview/${jobId}/${app.applicantId}`,
        {
          currentRound: app.currentRound,
          roundStatus: app.roundStatus,
          status: app.status,
          interviewMode: app.interviewMode,
          interviewTime: app.interviewTime,
          interviewLink: app.interviewLink,
          interviewAddress: app.interviewAddress,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      setEditRow(null); // ✅ exit edit mode
      fetchApplicant(); // ✅ reload fresh DB data
    } catch (err) {
      console.log("Save interview error:", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchApplied();
        if (data?.company) {
          await fetchCompanyData();
        }
        if (currentUser.id) {
          await fetchJobDetail();
        }
        if (jobId) await fetchApplicant();
      } catch (error) {
        console.error("Error during fetching and applying job:", error);
      }
      setLoading(false);
    };

    fetchData();
  }, [currentUser, data?.company, jobId]);

  return (
    <>
      {/*  any message here  */}
      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        message={toastMessage}
        delay={3000}
        position="bottom-end"
      />

      {loading ? (
        <div className="flex justify-center h-72 items-center">
          <i className="fa-solid fa-spinner fa-spin text-3xl" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 my-6 text-base max-sm:text-sm">
            <div className="flex flex-col grid-flow-row-dense gap-2">
              <div className="">
                {/* Company Details  */}
                <Accordion
                  defaultActiveKey={["0"]}
                  alwaysOpen
                  className="shadow rounded"
                >
                  <Accordion.Item eventKey="0">
                    <Accordion.Header>Company Details</Accordion.Header>
                    <Accordion.Body>
                      <div className="">
                        {/* company name  */}
                        <h3 className="text-3xl text-center border-b-2 py-4 mb-4">
                          {company?.companyName}
                        </h3>
                        <div className="border-b-2 px-2 pb-4 text-gray-500 text-justify leading-5">
                          {company?.companyDescription}
                        </div>
                        <div className="flex justify-between p-2 border-b-2 my-2">
                          {/* company website  */}
                          <span>Website</span>
                          <span className="bg-blue-500 py-1 px-2 text-white rounded cursor-pointer">
                            <a
                              href={`${company?.companyWebsite}`}
                              target="_blanck"
                              className="no-underline text-white"
                            >
                              {company?.companyWebsite}
                            </a>
                          </span>
                        </div>
                        <div className="flex justify-between p-2 border-b-2 my-2">
                          {/* company location  */}
                          <span>Job Locations</span>
                          <div className="flex gap-2">
                            {company?.companyLocation
                              ?.split(",")
                              .map((location, index) => (
                                <span
                                  key={index}
                                  className="bg-blue-500 py-1 px-2 text-white rounded"
                                >
                                  {location.trim()}
                                </span>
                              ))}
                          </div>
                        </div>
                        <div className="flex justify-between p-2 border-b-2 my-2">
                          {/* company difficulty  */}
                          <span>Difficulty Level</span>
                          {company?.companyDifficulty === "Easy" && (
                            <span className="bg-green-500 py-1 px-2 text-white rounded">
                              {company?.companyDifficulty}
                            </span>
                          )}
                          {company?.companyDifficulty === "Moderate" && (
                            <span className="bg-orange-500 py-1 px-2 text-white rounded">
                              {company?.companyDifficulty}
                            </span>
                          )}
                          {company?.companyDifficulty === "Hard" && (
                            <span className="bg-red-500 py-1 px-2 text-white rounded">
                              {company?.companyDifficulty}
                            </span>
                          )}
                        </div>
                      </div>
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              </div>

              {currentUser.role !== "student" && (
                <>
                  {/* pending */}
                  <div className="">
                    {/* Applicants applied */}
                    <Accordion
                      defaultActiveKey={["3"]}
                      alwaysOpen
                      className="shadow rounded"
                    >
                      <Accordion.Item eventKey="3">
                        <Accordion.Header>Applicants Applied</Accordion.Header>
                        <Accordion.Body>
                          {/* 📊 APPLICATION STATUS REPORT */}
                          <div className="bg-white p-4 rounded shadow mb-4">
                            <h5 className="text-center mb-3">
                              Application Status Report
                            </h5>

                            {filteredApplicants.length === 0 ? (
                              <p className="text-center text-gray-500">
                                No data available
                              </p>
                            ) : (
                              <div className="flex justify-center">
                                <PieChart width={320} height={260}>
                                  <Pie
                                    data={statusChartData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={90}
                                    label
                                  >
                                    {statusChartData.map((entry, index) => (
                                      <Cell
                                        key={`cell-${index}`}
                                        fill={STATUS_COLORS[index]}
                                      />
                                    ))}
                                  </Pie>
                                  <Tooltip />
                                  <Legend />
                                </PieChart>
                              </div>
                            )}
                          </div>

                          <div style={{ overflowX: "auto", width: "100%" }}>
                            <input
                              type="text"
                              className="form-control mb-2"
                              placeholder="Search anything in table..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <div className="d-flex gap-2 mb-2">
                              {/* Year Filter */}
                              <select
                                className="form-select"
                                value={yearFilter}
                                onChange={(e) => setYearFilter(e.target.value)}
                              >
                                <option value="">All Years</option>
                                {[
                                  ...new Set(
                                    editableApplicants
                                      .map((a) => a.year)
                                      .filter(Boolean),
                                  ),
                                ].map((year) => (
                                  <option key={year} value={year}>
                                    Year {year}
                                  </option>
                                ))}
                              </select>

                              {/* Job Status Filter */}
                              <select
                                className="form-select"
                                value={statusFilter}
                                onChange={(e) =>
                                  setStatusFilter(e.target.value)
                                }
                              >
                                <option value="">All Status</option>
                                <option value="interview">Interview</option>
                                <option value="hired">Hired</option>
                                <option value="rejected">Rejected</option>
                                <option value="hold">On Hold</option>
                              </select>
                            </div>
                            <div className="d-flex justify-content-end mb-2">
                              <Button
                                variant="success"
                                size="sm"
                                onClick={exportApplicantsCSV}
                              >
                                Export CSV
                              </Button>
                            </div>

                            <Table
                              striped
                              bordered
                              hover
                              size="sm"
                              className="text-center"
                              style={{ minWidth: "1200px" }}
                            >
                              <thead>
                                <tr>
                                  <th>#</th>
                                  <th>Name</th>
                                  <th>roll no</th>
                                  <th>Year</th>
                                  <th>Email</th>
                                  <th>Resume</th>
                                  <th>Applied at</th>

                                  <th>Current Round</th>
                                  <th>Round Result</th>
                                  <th>Job Status</th>
                                  <th>Mode</th>
                                  <th>Interview Date & Time</th>
                                  <th>Link / Address</th>
                                  <th>Save</th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredApplicants.length > 0 ? (
                                  filteredApplicants.map((app, index) => {
                                    // ✅ detect if already scheduled before
                                    const isExisting =
                                      app.currentRound ||
                                      app.status ||
                                      app.roundStatus;
                                    const isScheduled =
  app.currentRound ||
  app.roundStatus ||
  app.interviewMode ||
  app.interviewTime;

                                    return (
                                      <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td
                                          dangerouslySetInnerHTML={{
                                            __html: highlightText(app.name),
                                          }}
                                        />
                                        <td
                                          dangerouslySetInnerHTML={{
                                            __html: highlightText(
                                              app.rollNo || "-",
                                            ),
                                          }}
                                        />
                                        <td
                                          dangerouslySetInnerHTML={{
                                            __html: highlightText(
                                              app.year || "-",
                                            ),
                                          }}
                                        />
                                        <td
                                          dangerouslySetInnerHTML={{
                                            __html: highlightText(app.email),
                                          }}
                                        />

                                        <td>
                                          <a
                                            href={app.resume}
                                            target="_blank"
                                            rel="noreferrer"
                                          >
                                            View
                                          </a>
                                        </td>
                                        <td>
                                          {app.appliedAt
                                            ? new Date(
                                                app.appliedAt,
                                              ).toLocaleString("en-IN")
                                            : "-"}
                                        </td>

                                        {/* Current Round */}
                                        {/* Current Round */}
                                        <td>
                                          {editRow === index ? (
                                            <select
                                              value={app.currentRound || ""}
                                              onChange={(e) =>
                                                handleInterviewChange(
                                                  index,
                                                  "currentRound",
                                                  e.target.value,
                                                )
                                              }
                                            >
                                              <option value="">Select</option>
                                              <option value="Aptitude Test">
                                                Aptitude
                                              </option>
                                              <option value="Technical Interview">
                                                Technical
                                              </option>
                                              <option value="Group Discussion">
                                                GD
                                              </option>
                                              <option value="HR Interview">
                                                HR
                                              </option>
                                            </select>
                                          ) : (
                                            <span
                                              dangerouslySetInnerHTML={{
                                                __html: highlightText(
                                                  app.currentRound || "-",
                                                ),
                                              }}
                                            />
                                          )}
                                        </td>

                                        {/* Round Result */}
                                        <td>
                                          {editRow === index ? (
                                            <select
                                              value={app.roundStatus || ""}
                                              onChange={(e) =>
                                                handleInterviewChange(
                                                  index,
                                                  "roundStatus",
                                                  e.target.value,
                                                )
                                              }
                                            >
                                              <option value="">Select</option>
                                              <option value="pending">
                                                Pending
                                              </option>
                                              <option value="passed">
                                                Passed
                                              </option>
                                              <option value="failed">
                                                Failed
                                              </option>
                                            </select>
                                          ) : (
                                            <span
                                              dangerouslySetInnerHTML={{
                                                __html: highlightText(
                                                  app.roundStatus || "-",
                                                ),
                                              }}
                                            />
                                          )}
                                        </td>

                                        {/* Job Status */}
                                        <td>
                                          {editRow === index ? (
                                            <select
                                              value={app.status || ""}
                                              onChange={(e) =>
                                                handleInterviewChange(
                                                  index,
                                                  "status",
                                                  e.target.value,
                                                )
                                              }
                                            >
                                              <option value="">Select</option>
                                              <option value="interview">
                                                Interview
                                              </option>
                                              <option value="hired">
                                                Hired
                                              </option>
                                              <option value="rejected">
                                                Rejected
                                              </option>
                                              <option value="hold">
                                                On Hold
                                              </option>
                                            </select>
                                          ) : (
                                            <span
                                              dangerouslySetInnerHTML={{
                                                __html: highlightText(
                                                  app.status || "-",
                                                ),
                                              }}
                                            />
                                          )}
                                        </td>

                                        {/* Mode */}
                                        <td>
                                          {editRow === index ? (
                                            <select
                                              value={app.interviewMode || ""}
                                              onChange={(e) =>
                                                handleInterviewChange(
                                                  index,
                                                  "interviewMode",
                                                  e.target.value,
                                                )
                                              }
                                            >
                                              <option value="">Select</option>
                                              <option value="online">
                                                Online
                                              </option>
                                              <option value="offline">
                                                Offline
                                              </option>
                                            </select>
                                          ) : (
                                            <span
                                              dangerouslySetInnerHTML={{
                                                __html: highlightText(
                                                  app.interviewMode || "-",
                                                ),
                                              }}
                                            />
                                          )}
                                        </td>

                                        {/* Time */}
                                        <td>
                                          {editRow === index ? (
                                            <input
                                              type="datetime-local"
                                              value={
                                                app.interviewTime
                                                  ? new Date(app.interviewTime)
                                                      .toISOString()
                                                      .slice(0, 16)
                                                  : ""
                                              }
                                              onChange={(e) =>
                                                handleInterviewChange(
                                                  index,
                                                  "interviewTime",
                                                  e.target.value,
                                                )
                                              }
                                            />
                                          ) : app.interviewTime ? (
                                            new Date(
                                              app.interviewTime,
                                            ).toLocaleString("en-IN")
                                          ) : (
                                            "-"
                                          )}
                                        </td>

                                        {/* Link / Address */}
                                        <td>
                                          {editRow === index ? (
                                            <input
                                              value={
                                                app.interviewLink ||
                                                app.interviewAddress ||
                                                ""
                                              }
                                              onChange={(e) =>
                                                handleInterviewChange(
                                                  index,
                                                  app.interviewMode === "online"
                                                    ? "interviewLink"
                                                    : "interviewAddress",
                                                  e.target.value,
                                                )
                                              }
                                            />
                                          ) : (
                                            app.interviewLink ||
                                            app.interviewAddress ||
                                            "-"
                                          )}
                                        </td>

                                        {/* ACTION BUTTONS */}
                                        <td className="flex gap-2 justify-center">
                                         {editRow === index ? (
  <>
    <Button size="sm" onClick={() => saveInterview(index)}>
      Save
    </Button>

    <Button
      size="sm"
      variant="secondary"
      onClick={() => {
        setEditableApplicants(applicant); // reset row
        setEditRow(null);
      }}
    >
      Cancel
    </Button>
  </>
) : isScheduled ? (
  <Button size="sm" onClick={() => setEditRow(index)}>
    Edit
  </Button>
) : (
  <Button size="sm" onClick={() => setEditRow(index)}>
    Schedule
  </Button>
)}

                                        </td>
                                      </tr>
                                    );
                                  })
                                ) : (
                                  <tr>
                                    <td colSpan={14}>
                                      No Student Yet Applied!
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </Table>
                          </div>
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                  </div>
                </>
              )}
            </div>

            <div className="">
              {/* Job details  */}
              <Accordion
                defaultActiveKey={["1"]}
                alwaysOpen
                className="shadow rounded"
              >
                <Accordion.Item eventKey="1">
                  <Accordion.Header>Job Details</Accordion.Header>
                  <Accordion.Body>
                    <div className="flex flex-col gap-4">
                      {/* job title  */}
                      <div className="flex flex-col backdrop-blur-md bg-white/30 border border-white/20 rounded-lg px-2 shadow-sm shadow-red-400">
                        <span className="text-xl text-blue-500 py-2 border-b-2">
                          Job Title
                        </span>
                        <span className="py-3">{data?.jobTitle}</span>
                      </div>
                      {/* job Profile  */}
                      <div className="flex flex-col backdrop-blur-md bg-white/30 border border-white/20 rounded-lg px-2 shadow-sm shadow-red-400">
                        <span className="text-xl text-blue-500 py-2 border-b-2">
                          Job Profile
                        </span>
                        <span
                          className="py-3"
                          dangerouslySetInnerHTML={{
                            __html: data?.jobDescription,
                          }}
                        />
                      </div>
                      {/* job eligibility  */}
                      <div className="flex flex-col backdrop-blur-md bg-white/30 border border-white/20 rounded-lg px-2 shadow-sm shadow-red-400">
                        <span className="text-xl text-blue-500 py-2 border-b-2">
                          Eligibility
                        </span>
                        <span
                          className="py-3"
                          dangerouslySetInnerHTML={{
                            __html: data?.eligibility,
                          }}
                        />
                      </div>
                      {/* job salary  */}
                      <div className="flex flex-col backdrop-blur-md bg-white/30 border border-white/20 rounded-lg px-2 shadow-sm shadow-red-400">
                        <span className="text-xl text-blue-500 py-2 border-b-2">
                          Annual CTC
                        </span>
                        <span className="py-3">{data?.salary} LPA</span>
                      </div>
                      {/* job deadline  */}
                      <div className="flex flex-col backdrop-blur-md bg-white/30 border border-white/20 rounded-lg px-2 shadow-sm shadow-red-400">
                        <span className="text-xl text-blue-500 py-2 border-b-2">
                          Last Date of Application
                        </span>
                        <span className="py-3">
                          {new Date(
                            data?.applicationDeadline,
                          ).toLocaleDateString("en-IN", {
                            month: "long",
                            year: "numeric",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      {/* how to apply  */}
                      {(applied === true ||
                        currentUser?.role !== "student") && (
                        <div className="flex flex-col backdrop-blur-md bg-white/30 border border-white/20 rounded-lg px-2 shadow-sm shadow-red-400">
                          <span className="text-xl text-blue-500 py-2 border-b-2">
                            How to Apply?
                          </span>
                          <span
                            className="py-3"
                            dangerouslySetInnerHTML={{
                              __html: data?.howToApply,
                            }}
                          />
                        </div>
                      )}
                      {currentUser.role === "student" && (
                        <div className="flex justify-center">
                          {applied === false ? (
                            <Button variant="warning" onClick={handleApply}>
                              <i className="fa-solid fa-check px-2" />
                              Apply Now
                            </Button>
                          ) : (
                            <Link to={`/student/status/${jobId}`}>
                              <Button variant="warning">
                                <i className="fa-solid fa-check px-2" />
                                Update Status
                              </Button>
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </div>
          </div>
        </>
      )}

      {/* ModalBox Component for Delete Confirmation */}
      <ModalBox
        show={showModal}
        close={closeModal}
        header={"Confirmation"}
        body={modalBody}
        btn={"Apply"}
        confirmAction={handleConfirmApply}
      />
    </>
  );
}

export default ViewJobPost;
