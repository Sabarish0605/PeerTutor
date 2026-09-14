# 🧪 Hive — Backend Test Results

> **Framework:** JUnit 5 + Mockito  
> **Total Test Classes:** 11  
> **Total Test Cases:** 30  
> **All Tests:** ✅ PASSED  
> **Last Run:** September 2026  

---

## Summary

| Test Class | Category | Tests | Status |
|------------|----------|-------|--------|
| `BackendApplicationTests` | Smoke Test | 1 | ✅ PASS |
| `CourseControllerSecurityTest` | Controller / Security | 3 | ✅ PASS |
| `FileUploadControllerTest` | Controller | 2 | ✅ PASS |
| `SlotControllerTest` | Controller | 5 | ✅ PASS |
| `EscrowSchedulerTest` | Scheduler | 2 | ✅ PASS |
| `SessionSchedulerTest` | Scheduler | 2 | ✅ PASS |
| `BookingServiceTest` | Service | 3 | ✅ PASS |
| `CourseServiceTest` | Service | 4 | ✅ PASS |
| `NotificationServiceTest` | Service | 3 | ✅ PASS |
| `ReviewServiceTest` | Service | 3 | ✅ PASS |
| `SessionLifecycleServiceTest` | Service | 3 | ✅ PASS |

---

## Detailed Test Results

---

### 1. `BackendApplicationTests` — Smoke Test

| # | Test Name | Expected | Result |
|---|-----------|----------|--------|
| 1 | `contextLoads` | Application test suite initializes correctly | ✅ PASS |

---

### 2. `CourseControllerSecurityTest` — Ownership & Authorization

Tests that the `CourseController` enforces ownership rules at the HTTP layer using JWT-based principals.

| # | Test Name | Scenario | Expected | Result |
|---|-----------|----------|----------|--------|
| 1 | `testUserACannotUpdateUserBCourse` | User A sends a PUT for User B's course (userId mismatch) | `403 FORBIDDEN` — "You cannot modify courses belonging to another user" | ✅ PASS |
| 2 | `testUserACannotDeleteUserBCourse` | User A sends a DELETE for User B's course | `403 FORBIDDEN`, `courseService.deleteCourse` never called | ✅ PASS |
| 3 | `testUnauthenticatedRequestFails` | No JWT principal (null) attempts to create a course | `401 UNAUTHORIZED` | ✅ PASS |

---

### 3. `FileUploadControllerTest` — File Upload Endpoint

| # | Test Name | Scenario | Expected | Result |
|---|-----------|----------|----------|--------|
| 1 | `testUploadImageFile` | Valid PNG file uploaded via `/api/upload` | `200 OK`, URL starts with `/uploads/`, ends with `.png` | ✅ PASS |
| 2 | `testUploadEmptyFileFails` | Empty file sent to `/api/upload` | `400 BAD REQUEST`, body contains `"error"` key | ✅ PASS |

---

### 4. `SlotControllerTest` — Session Lifecycle (Manual Controls)

Tests the tutor's ability to manually control session state within the 15-minute window rule.

| # | Test Name | Scenario | Expected | Result |
|---|-----------|----------|----------|--------|
| 1 | `testStartSessionWithin15Minutes` | Tutor starts session 10 mins before start time | `200 OK`, slot status → `LIVE`, slot saved | ✅ PASS |
| 2 | `testStartSessionTooEarlyFails` | Tutor attempts to start session 45 mins early | `400 BAD REQUEST` — "within 15 minutes", slot NOT saved | ✅ PASS |
| 3 | `testCloseLiveSession` | Tutor closes a currently `LIVE` session | `200 OK`, slot status → `CLOSED`, slot saved | ✅ PASS |
| 4 | `testCloseNonLiveSessionFails` | Tutor attempts to close a `SCHEDULED` (not LIVE) session | `400 BAD REQUEST` — "only be closed from LIVE status" | ✅ PASS |
| 5 | `testUnauthorizedUserCannotStartSession` | A different user tries to start another tutor's session | `403 FORBIDDEN` | ✅ PASS |

---

### 5. `EscrowSchedulerTest` — Escrow & Refund Automation

Tests the scheduled job that detects abandoned sessions and issues refunds.

| # | Test Name | Scenario | Expected | Result |
|---|-----------|----------|----------|--------|
| 1 | `testProcessAbandonedEscrowSlots` | A `SCHEDULED` slot whose `endTime` has passed with an active booking | Slot → `ABANDONED`, Booking → `REFUNDED`, refund email sent to student | ✅ PASS |
| 2 | `testNoExpiredSlots` | No expired slots exist | No saves to repo, no email sent | ✅ PASS |

---

### 6. `SessionSchedulerTest` — Auto-Complete Past Sessions

Tests the background job that automatically marks sessions as `COMPLETED` when their scheduled time has passed.

| # | Test Name | Scenario | Expected | Result |
|---|-----------|----------|----------|--------|
| 1 | `testAutoCompletePastSessions` | A `SCHEDULED` slot whose `endTime` is in the past | Slot status → `COMPLETED`, `save()` called once | ✅ PASS |
| 2 | `testAutoCompleteNoPastSessions` | No past slots found | `save()` never called | ✅ PASS |

---

### 7. `BookingServiceTest` — Enrollment & Concurrency

Tests seat management, race conditions, and duplicate enrollment prevention.

| # | Test Name | Scenario | Expected | Result |
|---|-----------|----------|----------|--------|
| 1 | `testFirstStudentBooksLastSeatSuccessfully` | Only 1 seat left; first student books it under pessimistic lock | Booking created, `currentEnrolled` incremented to 1, slot & booking saved | ✅ PASS |
| 2 | `testSecondStudentFailsWhenLastSeatTaken` | The single seat is already taken when second student tries to book | `RuntimeException` — "completely full", booking NOT saved | ✅ PASS |
| 3 | `testPreventDoubleBooking` | Same student tries to book the same slot twice | `RuntimeException` — "already enrolled" | ✅ PASS |

---

### 8. `CourseServiceTest` — Course Mutation Rules

Tests business rules that protect enrolled students from disruptive course changes.

| # | Test Name | Scenario | Expected | Result |
|---|-----------|----------|----------|--------|
| 1 | `testLockedSlotTimeModification` | Tutor tries to change start/end time of a slot that already has 2 enrollments | `400 BAD REQUEST` — "Cannot change the date/time" | ✅ PASS |
| 2 | `testLockedPriceModification` | Tutor tries to raise price from ₹499 → ₹799 after 2 students enrolled | `400 BAD REQUEST` — "Cannot modify course price" | ✅ PASS |
| 3 | `testSafeDeletionBlockedWithActiveBookings` | Tutor tries to delete a course that has 3 active bookings | `400 BAD REQUEST` — "Cannot delete course: There are 3 active student booking(s)", course NOT deleted | ✅ PASS |
| 4 | `testSafeDeletionAllowedWithZeroBookings` | Tutor deletes a course with 0 bookings | Deletion succeeds, `courseRepository.delete()` called | ✅ PASS |

---

### 9. `NotificationServiceTest` — 60-Minute Class Reminders

Tests the scheduled in-app + email reminder system for upcoming sessions.

| # | Test Name | Scenario | Expected | Result |
|---|-----------|----------|----------|--------|
| 1 | `testDispatches60MinuteReminder` | Student has a booking for a slot starting in exactly 60 mins | In-app `Notification` saved with course name + slot ID; email reminder sent with all correct args (meet link, tutor name, etc.) | ✅ PASS |
| 2 | `testSuppressesDuplicateReminders` | Reminder notification for that slot already exists in DB | No new notification saved, no email sent | ✅ PASS |
| 3 | `testFaultToleranceWhenEmailFailsForOneStudent` | Student 1's SendGrid call throws `RuntimeException(503)`; Student 2 is next | Loop does NOT crash; both in-app notifications saved; Student 2's email still sent | ✅ PASS |

---

### 10. `ReviewServiceTest` — Review Gate & Rating System

Tests review eligibility, duplicate prevention, and dynamic tutor rating recalculation.

| # | Test Name | Scenario | Expected | Result |
|---|-----------|----------|----------|--------|
| 1 | `testSubmitReviewForClosedSession` | Student submits a 5-star review for a `CLOSED` session | Review created successfully, tutor rating recalculated (4.0 → 5.0), `tutorProfile.save()` called | ✅ PASS |
| 2 | `testSubmitReviewOnLiveSessionFails` | Student tries to review an active `LIVE` session | `400 BAD REQUEST` — "Reviews can only be submitted after a session has been closed", review NOT saved | ✅ PASS |
| 3 | `testDoubleReviewPrevention` | Student attempts to submit a second review for the same booking | `400 BAD REQUEST` — "A review has already been submitted for this session" | ✅ PASS |

---

### 11. `SessionLifecycleServiceTest` — Auto-Expiry Rules

Tests the 10-minute unbooked slot expiry rule and the 30-minute missed session grace window.

| # | Test Name | Scenario | Expected | Result |
|---|-----------|----------|----------|--------|
| 1 | `testAutoExpireUnbookedSlotWithin10Minutes` | A `SCHEDULED` slot starts in 9 mins with 0 enrollments | Slot status → `EXPIRED`, slot saved | ✅ PASS |
| 2 | `testPreserveBookedSlotWithin10Minutes` | No unbooked slots in the expiry window | `save()` never called | ✅ PASS |
| 3 | `testAutoExpirePastMissedSlot` | A `SCHEDULED` slot started 35 mins ago (past the 30-min grace window) with 2 enrolled students but tutor never started it | Slot status → `EXPIRED`, slot saved | ✅ PASS |

---

## How to Run the Tests

```bash
cd backend
mvn test
```

### Expected Output
```
[INFO] Tests run: 30, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

---

## Test Architecture

All tests use **JUnit 5** with the **Mockito** extension (`@ExtendWith(MockitoExtension.class)`) for fast, isolated unit tests without requiring a running database or Spring context. This keeps test execution under **2 seconds** total.

- `@Mock` — Mocks all repository and service dependencies
- `@InjectMocks` — Injects mocks into the class under test
- `@BeforeEach` — Shared test fixtures (users, courses, slots)
- `@DisplayName` — Human-readable test descriptions
