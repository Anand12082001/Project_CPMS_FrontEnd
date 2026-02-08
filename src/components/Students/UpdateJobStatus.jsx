import React, { useEffect, useState } from "react";
import Accordion from "react-bootstrap/Accordion";
import { useParams } from "react-router-dom";
import axios from "axios";
import Toast from "../Toast";
import { BASE_URL } from "../../config/backend_url";

function UpdateJobStatus() {
  document.title = "CPMS | Application Status";

  const { jobId } = useParams();

  const [application, setApplication] = useState(null);
  const [company, setCompany] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem("token");

        // 1️⃣ Logged-in student
        const userRes = await axios.get(`${BASE_URL}/user/detail`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUser(userRes.data);

        // 2️⃣ Application tracker (TPO-updated data)
        const appRes = await axios.get(
          `${BASE_URL}/tpo/application-tracker/${jobId}/${userRes.data.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setApplication(appRes.data);

        // 3️⃣ Company details
        const compRes = await axios.get(
          `${BASE_URL}/company/company-data?companyId=${appRes.data.job.company}`
        );
        setCompany(compRes.data.company);

        setLoading(false);
      } catch (err) {
        console.log(err);
        setToastMessage("You have not applied for this job");
        setShowToast(true);
        setLoading(false);
      }
    };

    loadData();
  }, [jobId]);

  if (loading) {
    return (
      <div className="flex justify-center h-72 items-center">
        <i className="fa-solid fa-spinner fa-spin text-3xl" />
      </div>
    );
  }

  return (
    <>
      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        message={toastMessage}
      />

      <div className="grid grid-cols-2 gap-4 my-6 max-sm:grid-cols-1">

        {/* 🔹 BASIC DETAILS */}
        <Accordion defaultActiveKey={["0"]} alwaysOpen>
          <Accordion.Item eventKey="0">
            <Accordion.Header>Basic Details</Accordion.Header>
            <Accordion.Body>
              <p><strong>Name:</strong> {currentUser?.first_name}</p>
              <p><strong>Email:</strong> {currentUser?.email}</p>
              <p><strong>Company:</strong> {company?.companyName}</p>
              <p><strong>Job Title:</strong> {application?.job?.jobTitle}</p>
              {/* <p>
                <strong>Applied At:</strong>{" "}
                {application?.createdAt
                  ? new Date(application.createdAt).toLocaleString("en-IN")
                  : "-"}
              </p> */}
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>

        {/* 🔹 APPLICATION STATUS */}
        <Accordion defaultActiveKey={["1"]} alwaysOpen>
          <Accordion.Item eventKey="1">
            <Accordion.Header>Application Status</Accordion.Header>
            <Accordion.Body>

              <p>
                <strong>Current Round:</strong>{" "}
                {application?.currentRound || "-"}
              </p>

              <p>
                <strong>Round Result:</strong>{" "}
                {application?.roundStatus || "-"}
              </p>

              <p>
                <strong>Job Status:</strong>{" "}
                <span
                  className={`px-2 py-1 rounded text-white ${
                    application?.status === "hired"
                      ? "bg-green-500"
                      : application?.status === "rejected"
                      ? "bg-red-500"
                      : "bg-blue-500"
                  }`}
                >
                  {application?.status || "Applied"}
                </span>
              </p>

              {/* 🔹 INTERVIEW DETAILS */}
              {/* INTERVIEW STATUS SECTION */}
{!application?.interviewMode ? (
  <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded">
    <strong>Interview not scheduled yet</strong>
    <p className="mb-0">
      Please wait. You will be notified once the TPO schedules your interview.
    </p>
  </div>
) : (
  <>
    <hr />
    <h6 className="text-blue-600 font-bold mb-2">
      Interview Details
    </h6>

    <p>
      <strong>Mode:</strong>{" "}
      {application.interviewMode.toUpperCase()}
    </p>

    {application?.interviewTime && (
      <p>
        <strong>Date & Time:</strong>{" "}
        {new Date(application.interviewTime).toLocaleString("en-IN")}
      </p>
    )}

    {application.interviewMode === "online" ? (
      <>
        <p>
          <strong>Interview Link:</strong>{" "}
          <span className="text-blue-600 break-all">
            {application.interviewLink}
          </span>
        </p>
        <p className="text-gray-600 italic">
          👉 Join the interview at the scheduled time
        </p>
      </>
    ) : (
      <>
        <p>
          <strong>Interview Address:</strong>{" "}
          {application.interviewAddress}
        </p>
        <p className="text-gray-600 italic">
          👉 Attend the interview at the given address on time
        </p>
      </>
    )}
  </>
)}

            </Accordion.Body>
          </Accordion.Item>
        </Accordion>

      </div>
    </>
  );
}

export default UpdateJobStatus;
