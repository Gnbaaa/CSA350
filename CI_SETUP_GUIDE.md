# CI/CD Setup Guide - Step by Step Instructions

## Алхам 1: Git Repository эхлүүлэх

Хэрэв таны төсөл Git repository биш бол:

```bash
cd /Users/ganbayar/Desktop/projects/CSA316/lab5
git init
git add .
git commit -m "Initial commit with CI/CD setup"
```

## Алхам 2: GitHub Repository үүсгэх

1. GitHub.com руу нэвтрэх
2. Баруун дээд буланд "+" товч дарах → "New repository" сонгох
3. Repository нэр оруулах (жишээ: `lab5-ci-cd`)
4. Public эсвэл Private сонгох
5. **"Initialize this repository with a README" сонгохгүй байх** (код аль хэдийн байгаа)
6. "Create repository" товч дарах

## Алхам 3: Local Repository-г GitHub-тай холбох

GitHub-д repository үүсгэсний дараа, дараах командуудыг ажиллуулах:

```bash
cd /Users/ganbayar/Desktop/projects/CSA316/lab5

# GitHub repository URL-ийг олох (GitHub-д repository үүсгэсний дараа харагдана)
# Жишээ: https://github.com/your-username/lab5-ci-cd.git

git remote add origin https://github.com/your-username/lab5-ci-cd.git
git branch -M main
git push -u origin main
```

**Анхаар:** `your-username` болон `lab5-ci-cd`-ийг өөрийн GitHub username болон repository нэрээр солих

## Алхам 4: GitHub Secrets тохируулах

### 4.1. Gmail App Password үүсгэх (Gmail ашиглаж байгаа бол)

1. Google Account руу нэвтрэх: https://myaccount.google.com/
2. **Security** хэсэг рүү орох
3. **2-Step Verification** идэвхжүүлэх (хэрэв идэвхжүүлээгүй бол)
4. **App passwords** хэсэг рүү орох
5. "Select app" → "Mail" сонгох
6. "Select device" → "Other (Custom name)" сонгох
7. "CI/CD" гэж нэрлэх
8. "Generate" товч дарах
9. **16 оронтой нууц үгийг хуулж авах** (энэ нь EMAIL_PASSWORD болно)

### 4.2. GitHub Repository-д Secrets нэмэх

1. GitHub repository-гийн хуудас руу орох
2. **Settings** таб дарах (repository-гийн дээд хэсэгт)
3. Зүүн талын цэснээс **Secrets and variables** → **Actions** сонгох
4. **New repository secret** товч дарах

#### Secret 1: EMAIL_USERNAME
- **Name:** `EMAIL_USERNAME`
- **Secret:** Gmail хаяг (жишээ: `your-email@gmail.com`)
- **Add secret** товч дарах

#### Secret 2: EMAIL_PASSWORD
- **Name:** `EMAIL_PASSWORD`
- **Secret:** Gmail App Password (16 оронтой код)
- **Add secret** товч дарах

#### Secret 3: EMAIL_TO
- **Name:** `EMAIL_TO`
- **Secret:** Мэйл мэдэгдэл хүлээн авах хаяг (жишээ: `your-email@gmail.com`)
- **Add secret** товч дарах

## Алхам 5: CI Pipeline-ийг турших

### 5.1. Код өөрчлөлт хийх

Жижиг өөрчлөлт хийж, push хийх:

```bash
# Жишээ: README файлд мэдээлэл нэмэх
echo "# CI/CD Pipeline Active" >> README.md

git add .
git commit -m "Test CI pipeline"
git push origin main
```

### 5.2. GitHub Actions-ийг шалгах

1. GitHub repository-гийн хуудас руу орох
2. Дээд цэснээс **Actions** таб дарах
3. Workflow ажиллаж байгааг харах болно
4. Workflow-ийн нэр дээр дарах → Дэлгэрэнгүй мэдээлэл харах

### 5.3. Workflow-ийн үр дүнг шалгах

- ✅ **Ногоон тэмдэг** = Бүх туршилт амжилттай
- ❌ **Улаан тэмдэг** = Туршилт амжилтгүй (мэйл мэдэгдэл илгээгдэнэ)

## Алхам 6: Мэйл мэдэгдлийг турших (сонголттой)

Туршилт амжилтгүй болгох үед мэйл мэдэгдэл ирэх эсэхийг шалгах:

1. Backend эсвэл Frontend-д алдаатай код нэмэх
2. Push хийх
3. Workflow амжилтгүй болно
4. Мэйл хайрцагтаа мэйл мэдэгдэл ирэх

## Асуудал гарвал

### Workflow ажиллахгүй байна
- `.github/workflows/ci.yml` файл зөв байгаа эсэхийг шалгах
- GitHub repository-д файл push хийгдсэн эсэхийг шалгах
- Branch нэр `main` эсвэл `develop` байгаа эсэхийг шалгах

### Мэйл мэдэгдэл ирэхгүй байна
- GitHub Secrets зөв тохируулсан эсэхийг шалгах
- Gmail App Password зөв үүсгэсэн эсэхийг шалгах
- Spam хайрцагт байгаа эсэхийг шалгах

### Туршилт амжилтгүй болж байна
- Локаль дээр туршилт ажиллуулах:
  ```bash
  cd backend && npm test
  cd ../frontend && npm test
  ```
- Локаль дээр амжилттай бол GitHub Actions-ийн лог шалгах

## Ашигтай холбоосууд

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [GitHub Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

