# CI/CD Pipeline Documentation

## Тайлбар

Энэхүү CI pipeline нь код орсоны дараа автоматаар нэгж туршилтуудыг ажиллуулж, туршилт амжилтгүй болгох үед мэйл мэдэгдэл илгээдэг.

## Workflow-ийн бүтэц

### 1. Backend Tests
- Node.js 20 ашиглана
- Dependencies суулгана
- ESLint ажиллуулна
- Jest ашиглан нэгж туршилтуудыг ажиллуулна
- Туршилтын үр дүнг artifact болгон хадгална

### 2. Frontend Tests
- Node.js 20 ашиглана
- Dependencies суулгана
- ESLint ажиллуулна
- Vitest ашиглан нэгж туршилтуудыг ажиллуулна
- Туршилтын үр дүнг artifact болгон хадгална

### 3. Build Check
- Backend болон Frontend-ийг бүтээж шалгана
- TypeScript compilation алдааг илрүүлнэ

### 4. Email Notification
- Дээрх ажлуудын аль нэг нь амжилтгүй болвол мэйл илгээнэ
- Мэйлд дараах мэдээлэл байна:
  - Repository нэр
  - Branch нэр
  - Commit SHA
  - Ажлуудын үр дүн
  - Дэлгэрэнгүй мэдээлэлтэй холбоос

## GitHub Secrets тохируулах

CI pipeline ажиллахын тулд дараах secrets-уудыг GitHub repository-д тохируулах шаардлагатай:

### 1. Repository Settings руу орох
- GitHub repository-гийн Settings → Secrets and variables → Actions

### 2. Дараах secrets нэмэх:

#### EMAIL_USERNAME
- Gmail хаяг эсвэл бусад SMTP серверийн username
- Жишээ: `your-email@gmail.com`

#### EMAIL_PASSWORD
- Gmail-ийн App Password (Gmail ашиглаж байгаа бол)
- Эсвэл бусад SMTP серверийн нууц үг
- Gmail App Password үүсгэх: https://support.google.com/accounts/answer/185833

#### EMAIL_TO
- Мэйл мэдэгдэл хүлээн авах хаяг
- Жишээ: `team@company.com` эсвэл `developer@example.com`

### Gmail App Password үүсгэх алхам:

1. Google Account руу нэвтрэх
2. Security → 2-Step Verification идэвхжүүлэх (шаардлагатай)
3. App passwords → Select app: Mail, Select device: Other
4. Үүссэн 16 оронтой нууц үгийг `EMAIL_PASSWORD` secret болгон ашиглах

## Workflow ажиллуулах нөхцөл

Workflow дараах тохиолдолд автоматаар ажиллана:

- `main` эсвэл `develop` branch руу push хийхэд
- `main` эсвэл `develop` branch руу pull request үүсгэхэд

## Локаль дээр туршилт ажиллуулах

### Backend
```bash
cd backend
npm install
npm test
npm run lint
```

### Frontend
```bash
cd frontend
npm install
npm test
npm run lint
```

## Workflow файлын байршил

```
.github/
└── workflows/
    └── ci.yml
```

## Дэлгэрэнгүй мэдээлэл

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Jest Documentation](https://jestjs.io/)
- [Vitest Documentation](https://vitest.dev/)

