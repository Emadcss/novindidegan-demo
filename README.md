# کیوسک نوبت‌دهی نوین دیدگان — دمو

دموی استاتیک (HTML/CSS/JS) برای نمایش به کلینیک.

## اجرای محلی

فایل `index.html` را با یک سرور استاتیک باز کنید:

```bash
npx serve .
# یا
python3 -m http.server 8080
```

## انتشار روی GitHub Pages

1. یک ریپوی جدید بسازید (مثلاً `novindidegan-demo`)
2. محتویات این پوشه را push کنید
3. در Settings → Pages:
   - Source: **Deploy from a branch**
   - Branch: `main` / root
4. بعد از یک دقیقه لینک آماده است:
   `https://YOUR_USERNAME.github.io/novindidegan-demo/`

## تست سریع ادمین

1. از کیوسک یک نوبت ثبت کنید
2. در Console باید ببینید: `[novindidegan] appointment registered ...`
3. به صفحه ورود برگردید → ادمین
4. نوبت باید بالای لیست باشد

داده در `localStorage` مرورگر ذخیره می‌شود (کلید: `novindidegan_demo_v1`).
