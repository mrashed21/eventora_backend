---

# 1️⃣ User

সিস্টেমের মূল authentication entity।

### Fields

| Field              | Type                | Description                                |
| ------------------ | ------------------- | ------------------------------------------ |
| id (PK)            | string              | ইউনিক ইউজার আইডি                           |
| email              | string (unique)     | লগইন ইমেইল                                 |
| password           | string              | hashed password                            |
| role               | UserRole (enum)     | ADMIN / DOCTOR / PATIENT                   |
| status             | UserStatus          | ACTIVE / BLOCKED                           |
| needPasswordChange | boolean             | প্রথম লগইনের পর password change দরকার কিনা |
| emailVerified      | boolean             | ইমেইল verify হয়েছে কিনা                    |
| createdAt          | DateTime            | তৈরির সময়                                  |
| updatedAt          | DateTime            | আপডেট সময়                                  |
| deletedAt          | DateTime (nullable) | soft delete                                |

### Relation

- 🔗 User → Account (1:1)
- 🔗 User → Admin (1:1 optional)
- 🔗 User → Doctor (1:1 optional)
- 🔗 User → Patient (1:1 optional)
- 🔗 User → Verification (1:M)
- 🔗 User → Session (1:M)

---

# 2️⃣ Account

Authentication provider information রাখে।

### Fields

| Field        | Type     |
| ------------ | -------- |
| id (PK)      | string   |
| userId (FK)  | string   |
| providerId   | string   |
| identifier   | string   |
| accessToken  | string   |
| refreshToken | string   |
| idToken      | string   |
| expiresAt    | DateTime |
| createdAt    | DateTime |
| updatedAt    | DateTime |

### Relation

- 🔗 Account.userId → User.id (Many account per user)

---

# 3️⃣ Admin

Admin specific data

| Field         | Type     |
| ------------- | -------- |
| id (PK)       | string   |
| userId (FK)   | string   |
| name          | string   |
| contactNumber | string   |
| profilePhoto  | string   |
| createdAt     | DateTime |
| updatedAt     | DateTime |

Relation:

- 🔗 Admin.userId → User.id (1:1)

---

# 4️⃣ Doctor

ডাক্তারদের তথ্য

### Fields

| Field               | Type       |
| ------------------- | ---------- |
| id (PK)             | string     |
| userId (FK)         | string     |
| registrationNumber  | string     |
| qualification       | string     |
| designation         | string     |
| currentWorkingPlace | string     |
| experience          | int        |
| appointmentFee      | float      |
| gender              | Gender     |
| bloodGroup          | BloodGroup |
| profilePhoto        | string     |
| rating              | float      |
| createdAt           | DateTime   |
| updatedAt           | DateTime   |
| isDeleted           | boolean    |

### Relation

- 🔗 Doctor.userId → User.id
- 🔗 Doctor → DoctorSpecialty (1:M)
- 🔗 Doctor → DoctorSchedule (1:M)
- 🔗 Doctor → Appointment (1:M)
- 🔗 Doctor → Review (1:M)

---

# 5️⃣ Patient

রোগীর তথ্য

| Field         | Type          |
| ------------- | ------------- |
| id (PK)       | string        |
| userId (FK)   | string        |
| name          | string        |
| contactNumber | string        |
| address       | string        |
| dateOfBirth   | Date          |
| gender        | Gender        |
| bloodGroup    | BloodGroup    |
| maritalStatus | MaritalStatus |
| profilePhoto  | string        |
| createdAt     | DateTime      |
| updatedAt     | DateTime      |
| isDeleted     | boolean       |

### Relation

- 🔗 Patient → Appointment (1:M)
- 🔗 Patient → PatientHealthData (1:1)
- 🔗 Patient → Review (1:M)
- 🔗 Patient → MedicalReport (1:M)

---

# 6️⃣ PatientHealthData

রোগীর মেডিকেল ব্যাকগ্রাউন্ড

| Field               | Type     |
| ------------------- | -------- |
| id (PK)             | string   |
| patientId (FK)      | string   |
| height              | float    |
| weight              | float    |
| hasAllergies        | boolean  |
| hasDiabetes         | boolean  |
| hasPastSurgeries    | boolean  |
| smokingStatus       | boolean  |
| dietaryPreference   | string   |
| pregnancyStatus     | boolean  |
| mentalHealthHistory | string   |
| immunizationStatus  | string   |
| recentDepression    | boolean  |
| recentAnxiety       | boolean  |
| createdAt           | DateTime |
| updatedAt           | DateTime |

Relation:

- 🔗 patientId → Patient.id (1:1)

---

# 7️⃣ Specialty

ডাক্তারদের স্পেশালাইজেশন

| Field     | Type     |
| --------- | -------- |
| id (PK)   | string   |
| title     | string   |
| icon      | string   |
| createdAt | DateTime |

Relation:

- 🔗 Specialty → DoctorSpecialty (1:M)

---

# 8️⃣ DoctorSpecialty (Junction Table)

Many-to-Many relation Doctor ↔ Specialty

| Field            | Type   |
| ---------------- | ------ |
| id (PK)          | string |
| doctorId (FK)    | string |
| specialtyId (FK) | string |

Relation:

- 🔗 doctorId → Doctor.id
- 🔗 specialtyId → Specialty.id

---

# 9️⃣ Schedule

Generic schedule

| Field     | Type     |
| --------- | -------- |
| id (PK)   | string   |
| startDate | Date     |
| endDate   | Date     |
| startTime | Time     |
| endTime   | Time     |
| createdAt | DateTime |

---

# 🔟 DoctorSchedule

Doctor এর availability

| Field           | Type    |
| --------------- | ------- |
| id (PK)         | string  |
| doctorId (FK)   | string  |
| scheduleId (FK) | string  |
| isBooked        | boolean |

Relation:

- 🔗 doctorId → Doctor.id
- 🔗 scheduleId → Schedule.id

---

# 1️⃣1️⃣ Appointment

| Field           | Type     |
| --------------- | -------- |
| id (PK)         | string   |
| doctorId (FK)   | string   |
| patientId (FK)  | string   |
| scheduleId (FK) | string   |
| status          | string   |
| videoCallingId  | string   |
| createdAt       | DateTime |
| updatedAt       | DateTime |

Relation:

- 🔗 Doctor (M:1)
- 🔗 Patient (M:1)
- 🔗 Schedule (M:1)
- 🔗 Appointment → Payment (1:1)
- 🔗 Appointment → Prescription (1:1)

---

# 1️⃣2️⃣ Prescription

| Field              | Type     |
| ------------------ | -------- |
| id (PK)            | string   |
| appointmentId (FK) | string   |
| instruction        | string   |
| followupDate       | Date     |
| createdAt          | DateTime |

Relation:

- 🔗 appointmentId → Appointment.id

---

# 1️⃣3️⃣ MedicalReport

| Field          | Type     |
| -------------- | -------- |
| id (PK)        | string   |
| patientId (FK) | string   |
| reportName     | string   |
| reportLink     | string   |
| createdAt      | DateTime |

Relation:

- 🔗 patientId → Patient.id

---

# 1️⃣4️⃣ Review

| Field          | Type     |
| -------------- | -------- |
| id (PK)        | string   |
| doctorId (FK)  | string   |
| patientId (FK) | string   |
| rating         | float    |
| comment        | string   |
| createdAt      | DateTime |

Relation:

- 🔗 Doctor (M:1)
- 🔗 Patient (M:1)

---

# 1️⃣5️⃣ Payment

| Field              | Type          |
| ------------------ | ------------- |
| id (PK)            | string        |
| appointmentId (FK) | string        |
| amount             | float         |
| transactionId      | string        |
| paymentStatus      | PaymentStatus |
| paymentGatewayData | JSON          |
| createdAt          | DateTime      |

Relation:

- 🔗 appointmentId → Appointment.id (1:1)

---

# 1️⃣6️⃣ Verification

OTP / Email verification

| Field       | Type     |
| ----------- | -------- |
| id (PK)     | string   |
| userId (FK) | string   |
| token       | string   |
| expiresAt   | DateTime |
| createdAt   | DateTime |

Relation:

- 🔗 userId → User.id

---

# 1️⃣7️⃣ Session

Login session tracking

| Field       | Type     |
| ----------- | -------- |
| id (PK)     | string   |
| userId (FK) | string   |
| ipAddress   | string   |
| userAgent   | string   |
| createdAt   | DateTime |

Relation:

- 🔗 userId → User.id

---

# 🔷 ENUM Types

### UserRole

- ADMIN
- DOCTOR
- PATIENT

### UserStatus

- ACTIVE
- BLOCKED

### Gender

- MALE
- FEMALE
- OTHER

### BloodGroup

- A+, A-, B+, B-, O+, O-, AB+, AB-

### MaritalStatus

- SINGLE
- MARRIED

### PaymentStatus

- PENDING
- PAID
- FAILED

---

# 🔶 Complete Relationship Summary (High-Level Architecture)

```
User
 ├── Admin
 ├── Doctor
 │     ├── DoctorSpecialty ── Specialty
 │     ├── DoctorSchedule ── Schedule
 │     ├── Appointment ── Prescription
 │     │            └── Payment
 │     └── Review
 └── Patient
       ├── PatientHealthData
       ├── Appointment
       ├── Review
       └── MedicalReport
```

---

# 🎯 Overall Architecture Insight

এই ERD একটি **Role-Based Healthcare Management Backend System** যেখানে:

- Authentication Layer (User, Account, Session, Verification)
- Core Domain Layer (Doctor, Patient, Specialty)
- Booking Layer (Schedule, DoctorSchedule, Appointment)
- Clinical Layer (Prescription, MedicalReport)
- Billing Layer (Payment)
- Feedback Layer (Review)

---



