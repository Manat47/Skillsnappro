# Frontend Plan — SkillSnapPro

## Project Overview
SkillSnapPro คือแพลตฟอร์มสำหรับให้นักศึกษาสร้างโปรไฟล์ แสดงทักษะ และโชว์ผลงาน/โปรเจกต์ของตัวเองอย่างเป็นระบบ โดย backend หลักถูกพัฒนาเสร็จในระดับ MVP แล้ว และ frontend จะเริ่มต่อจาก API ที่มีอยู่จริง

---

## Frontend Goal
เป้าหมายของ frontend คือ:

1. ให้ผู้ใช้สมัครสมาชิกและเข้าสู่ระบบได้
2. ให้ผู้ใช้ดูและแก้ไขโปรไฟล์ของตัวเองได้
3. ให้ผู้ใช้จัดการ skill ในโปรไฟล์ของตัวเองได้
4. ให้ผู้ใช้จัดการโปรเจกต์ของตัวเองได้
5. ให้ผู้ใช้ดู public profile / public project ของผู้อื่นได้ในอนาคต
6. ทำ UI ให้ดูสะอาด ใช้งานง่าย และค่อย ๆ ขยายได้

---

## Tech Stack
Frontend ใช้:

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- Axios
- TanStack Query (React Query)

---

## Project Structure Guideline
ให้ใช้โครงสร้างประมาณนี้:

```txt
src/
  app/
    login/
    register/
    me/
      profile/
      skills/
      projects/
    projects/
      [id]/
  lib/
    api.ts
    auth.ts
  components/
    ui/
    layout/
  features/
    auth/
    profile/
    skills/
    projects/
```

## Backend Base URL
Frontend ต้องเรียก backend จาก environment variable นี้:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```
## Authentication Flow
ระบบใช้ JWT แบบ Bearer Token

### Login
Endpoint: `POST /auth/login`

Request body:

```json
{
  "email": "test@example.com",
  "password": "12345678"
}
```

Response:

```json
{
  "message": "เข้าสู่ระบบสำเร็จ",
  "access_token": "..."
}
```

### Register
Endpoint: `POST /auth/register`

Request body:

```json
{
  "email": "test@example.com",
  "password": "12345678",
  "full_name": "Test User"
}
```
### Token Storage
ในเวอร์ชันแรก ให้เก็บ access_token ไว้ใน localStorage

### Auth Header
ทุก request ที่ต้อง login ต้องแนบ header:
```txt
Authorization: Bearer <token>
```

## Current Available Backend APIs

### Auth
- POST /auth/register
- POST /auth/login
- GET /auth/me

### Profile
- GET /profile/me
- PATCH /profile/me
- GET /profile/:userId

### Skills
- GET /skills
- POST /skills (ADMIN only)
- PATCH /skills/:id (ADMIN only)
- DELETE /skills/:id (ADMIN only)

### My Profile Skills
- GET /profile/me/skills
- PUT /profile/me/skills
- POST /profile/me/skills
- DELETE /profile/me/skills/:skillId

### Projects
- Project CRUD พร้อมใช้งานใน backend แล้ว
- ProjectMedia / ProjectTags / ProjectMembers พร้อมใน backend แล้ว

หมายเหตุ: frontend จะเริ่มใช้เฉพาะ endpoint ที่จำเป็นในแต่ละเฟสก่อน

## Frontend Development Phases

### Phase FE-1: App Scaffold

#### Goal
สร้างโครงสร้าง frontend ให้พร้อมสำหรับต่อ API

#### Scope
- setup Next.js App Router
- setup Tailwind
- setup `src/lib/api.ts`
- setup layout พื้นฐาน
- setup route เปล่าตามนี้:
  - `/login`
  - `/register`
  - `/me/profile`
  - `/me/skills`
  - `/me/projects`

#### Definition of Done
- หน้าแต่ละ route เปิดได้
- มี layout พื้นฐาน
- มี axios client กลาง

### Phase FE-2: Auth UI

#### Goal
ทำหน้า login/register ให้ใช้ได้จริง

#### Scope
- `/login`
  - form email/password
  - submit ไป `POST /auth/login`
  - ถ้าสำเร็จเก็บ token ใน `localStorage`
  - redirect ไป `/me/profile`
- `/register`
  - form email/password/full_name
  - submit ไป `POST /auth/register`
  - success message
  - redirect ไป `/login` หรือ auto login

#### Definition of Done
- login ใช้งานได้จริง
- register ใช้งานได้จริง
- error แสดงผลได้
- token ถูกเก็บและใช้งานได้

### Phase FE-3: Profile UI

#### Goal
ให้ user ดูและแก้ไขโปรไฟล์ตัวเองได้

#### Scope
- `/me/profile`
- ใช้ `GET /profile/me`
- แสดง:
  - `full_name`
  - `bio`
  - `avatar_url`
  - `visibility`
- form update ใช้ `PATCH /profile/me`

#### Definition of Done
- โหลดข้อมูลตัวเองได้
- แก้ไขแล้วบันทึกได้
- แสดง loading / success / error state

### Phase FE-4: Skills UI

#### Goal
ให้ user จัดการ skills ของตัวเองได้

#### Scope
- `/me/skills`
- ใช้ `GET /skills` สำหรับ master list
- ใช้ `GET /profile/me/skills` สำหรับ skill ปัจจุบัน
- แสดง UI แบบเลือกหลายอันได้
- save ด้วย `PUT /profile/me/skills`

#### Definition of Done
- เห็น skill ทั้งหมด
- เห็น skill ที่ตัวเองมี
- เพิ่ม/ลบ/แทนที่ทั้งชุดได้
- ข้อมูล sync กับ backend จริง

### Phase FE-5: Projects UI (MVP)

#### Goal
ให้ user จัดการโปรเจกต์ของตัวเองได้

#### Scope
- `/me/projects`
  - list projects ของตัวเอง
  - create project
  - edit project
  - delete project
- `/projects/[id]`
  - ดูรายละเอียดโปรเจกต์
  - แก้ไขของตัวเอง

#### Definition of Done
- CRUD project ทำงานจริง
- เชื่อม API backend ตรงตาม spec
- owner-only flow ถูกต้อง

### Phase FE-6: Project Extras

#### Goal
ต่อ feature ย่อยของโปรเจกต์

#### Scope
- ProjectMedia
- ProjectTags
- ProjectMembers

#### Definition of Done
- จัดการ media ได้
- จัดการ tags ได้
- จัดการ members ได้
- permission ถูกต้อง

### Phase FE-7: Public Pages

#### Goal
ทำหน้า public profile / public project

#### Scope
- public profile page
- public project page
- handle 403 / private visibility
- UI อ่านง่าย

#### Definition of Done
- โปรไฟล์ public ดูได้
- โปรไฟล์ private ถูก block ถูกต้อง
- โปรเจกต์ public แสดงผลได้

## UI/UX Guidelines
- ใช้ style ที่สะอาด เรียบง่าย อ่านง่าย
- เน้น form usability
- แสดง loading / empty / error state ทุกหน้าที่โหลดข้อมูล
- อย่าใส่อนิเมชันเกินจำเป็น
- หน้า dashboard ควรเริ่มจากของจำเป็นก่อน
- อย่าใส่ business logic เยอะใน page file เดียว
- พยายามแยก component และ helper ให้เป็นระเบียบ

## API Integration Rules
- ห้าม hardcode URL backend ใน component
- ให้เรียกผ่าน `src/lib/api.ts`
- แนบ Bearer token อัตโนมัติสำหรับ protected routes
- ถ้า token ไม่มีหรือหมดอายุ ให้ redirect ไป `/login`
- อย่าเดา endpoint ใหม่เอง ให้ใช้ตาม backend ที่มีจริงเท่านั้น

## Code Style Rules
- ใช้ TypeScript ทุกที่
- แยก component ตาม feature
- หลีกเลี่ยงไฟล์ยาวเกินไป
- ตั้งชื่อให้สื่อความหมาย
- ถ้าทำ form ให้มี state ชัดเจน:
  - loading
  - success
  - error
- ถ้าแก้โค้ด ให้แก้เฉพาะ scope ที่เกี่ยวข้อง

## What Codex Should NOT Do
- ห้ามแก้ backend
- ห้ามเดา API endpoint ใหม่
- ห้ามเปลี่ยน shape ของ request/response เอง
- ห้ามสร้าง auth flow ใหม่
- ห้ามใช้ state management ใหญ่เกินจำเป็น
- ห้ามยัดทุกอย่างไว้ในไฟล์เดียว

## Definition of Success
Frontend ถือว่าเดินมาถูกทางเมื่อ:
- login/register ใช้งานได้
- user เข้าหน้า profile ของตัวเองได้
- user แก้ profile ได้
- user จัดการ skills ของตัวเองได้
- user จัดการ projects ของตัวเองได้
- UI ใช้งานง่ายและต่อยอดได้

## Current Priority
ลำดับการทำงานปัจจุบัน:
1. Scaffold frontend
2. Login/Register
3. Profile page
4. Skills page
5. Projects page
6. Project extras
7. Public pages

## Notes for Codex
- อ่านไฟล์นี้ก่อนทุกครั้ง
- ทำงานเป็นเฟส อย่าทำทุกอย่างพร้อมกัน
- สรุปไฟล์ที่แก้ทุกครั้ง
- ถ้ามี assumption ให้บอกชัดเจน
- ถ้า endpoint ไหนยังไม่แน่ใจ ให้หยุดที่ scaffold ไม่ต้องเดา logic