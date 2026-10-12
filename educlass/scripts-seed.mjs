import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
const env = Object.fromEntries(readFileSync(new URL(".env.local", import.meta.url),"utf8").split("\n").filter(l=>l.includes("=")).map(l=>{const i=l.indexOf("=");return [l.slice(0,i).trim(), l.slice(i+1).trim()]}));
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const now = Date.now(); const H=3600_000; const iso=(ms)=>new Date(now+ms).toISOString();
console.log("Seeding Supabase:", env.NEXT_PUBLIC_SUPABASE_URL);
// 1. auth users + profiles
const users = [
  { email:"budi@educlass.id", password:"budi123", name:"Dr. Budi Santoso", nim:null, nip:"198512102005011002", role:"admin" },
  { email:"ahmad@educlass.id", password:"ahmad123", name:"Ahmad Fauzi", nim:"2301005", role:"student" },
  { email:"rina@educlass.id", password:"rina123", name:"Rina Maharani", nim:"2301006", role:"student" },
  { email:"citra@educlass.id", password:"citra123", name:"Citra Dewi", nim:"2301007", role:"student" },
];
const idMap={};
for(const u of users){
  const { data, error } = await admin.auth.admin.createUser({ email:u.email, password:u.password, email_confirm:true, user_metadata:{ name:u.name, nim:u.nim, role:u.role }});
  if(error && !error.message.includes("already")) { console.log("createUser",u.email,error.message); continue; }
  let uid = data?.user?.id;
  if(error && error.message.includes("already")){
    const { data: list } = await admin.auth.admin.listUsers({page:1, perPage:100});
    uid = list.users.find(x=>x.email===u.email)?.id;
    console.log("reuse",u.email,uid);
  } else console.log("created",u.email,uid);
  idMap[u.email]=uid;
  const { error:e2 } = await admin.from("profiles").upsert({ id:uid, name:u.name, nim:u.nim, nip:u.nip??null, email:u.email, role:u.role }, {onConflict:"id"});
  console.log(" profile",u.email, e2? e2.message:"OK");
}
// 2. courses
const courses = [
  { old:"c-web", name:"Pemrograman Web", code:"IF203", description:"Mata kuliah dasar pengembangan web." },
  { old:"c-db", name:"Basis Data", code:"IF204", description:"Konsep perancangan dan pengelolaan basis data." },
];
const courseMap={};
for(const c of courses){
  const { data, error } = await admin.from("courses").insert({ name:c.name, code:c.code, description:c.description, created_by:idMap["budi@educlass.id"] }).select().single();
  if(error) console.log("course",c.old,error.message);
  else { courseMap[c.old]=data.id; console.log("course",c.old,"->",data.id); }
}
// 3. assignments
const assigns=[
  { old:"a-quiz", course:"c-web", title:"Quiz Pemrograman Web", description:"Kuis mingguan: HTML, CSS, dan JavaScript dasar.", start:iso(-1*H), deadline:iso(3*H), status:"" },
  { old:"a-tugas1", course:"c-db", title:"Tugas 1 Basis Data", description:"Kerjakan soal pada buku tulis. Setelah selesai, scan atau foto hasil pekerjaan dan kumpulkan dalam format PDF.", start:iso(-6*24*H), deadline:iso(-3*24*H), status:"" },
  { old:"a-kuis6", course:"c-db", title:"Kuis Minggu 6", description:"Normalisasi dan ERD.", start:iso(24*H), deadline:iso(26*H), status:"" },
  { old:"a-tugas2", course:"c-web", title:"Tugas 2 Pemrograman Web", description:"Membangun halaman profil menggunakan CSS Grid.", start:iso(-2*H), deadline:iso(1*H), status:"draft" },
];
const assignMap={};
for(const a of assigns){
  const { data, error } = await admin.from("assignments").insert({ course_id:courseMap[a.course], title:a.title, description:a.description, start_time:a.start, deadline:a.deadline, status:a.status, created_by:idMap["budi@educlass.id"] }).select().single();
  if(error) console.log("assign",a.old,error.message);
  else { assignMap[a.old]=data.id; console.log("assign",a.old,"->",data.id); }
}
// 4. questions
const qs=[
  { old:"q-pg1", assign:"a-quiz", text:"Apa fungsi utama HTML?", type:"multiple_choice", method:"text", score:10, order:1 },
  { old:"q-essay1", assign:"a-quiz", text:"Jelaskan pengertian HTML dan berikan contoh penggunaannya.", type:"essay", method:"text", score:20, order:2 },
  { old:"q-essay2", assign:"a-quiz", text:"Kerjakan soal pada buku tulis. Setelah selesai, scan atau foto hasil pekerjaan, gabungkan, dan kumpulkan dalam bentuk PDF.\n\nBuatlah sebuah halaman HTML dengan struktur semantik (header, nav, main, footer).", type:"essay", method:"pdf", score:20, order:3 },
  { old:"q-t1", assign:"a-tugas1", text:"Jelaskan perbedaan primary key dan foreign key, serta berikan contoh penerapannya dalam sebuah tabel.", type:"essay", method:"pdf", score:100, order:1 },
  { old:"q-t2", assign:"a-kuis6", text:"Apa yang dimaksud normalisasi basis data?", type:"essay", method:"text", score:100, order:1 },
];
const qMap={};
for(const q of qs){
  const { data, error } = await admin.from("questions").insert({ assignment_id:assignMap[q.assign], question_text:q.text, question_type:q.type, answer_method:q.method, score:q.score, order_number:q.order }).select().single();
  if(error) console.log("q",q.old,error.message);
  else { qMap[q.old]=data.id; console.log("q",q.old,"->",data.id); }
}
// 5. options
const opts=[
  { q:"q-pg1", text:"Membuat struktur halaman web", key:"A", correct:true },
  { q:"q-pg1", text:"Mengelola database", key:"B", correct:false },
  { q:"q-pg1", text:"Membuat server", key:"C", correct:false },
  { q:"q-pg1", text:"Mengatur jaringan", key:"D", correct:false },
];
for(const o of opts){
  const { error } = await admin.from("question_options").insert({ question_id:qMap[o.q], option_text:o.text, option_key:o.key, is_correct:o.correct });
  if(error) console.log("opt",o.key,error.message);
}
console.log("opts OK");
// 6. submissions
const subs=[
  { old:"s-t1-ahmad", assign:"a-tugas1", email:"ahmad@educlass.id", at:iso(-3*24*H-2*H), status:"graded", score:85, feedback:"Jawaban sudah benar. Perhatikan konsistensi penamaan kolom." },
  { old:"s-t1-rina", assign:"a-tugas1", email:"rina@educlass.id", at:iso(-3*24*H-H), status:"graded", score:90, feedback:"Sangat baik, contoh penerapan lengkap." },
  { old:"s-quiz-rina", assign:"a-quiz", email:"rina@educlass.id", at:iso(-30*60000), status:"submitted", score:null, feedback:null },
];
const subMap={};
for(const s of subs){
  const { data, error } = await admin.from("submissions").insert({ assignment_id:assignMap[s.assign], student_id:idMap[s.email], submitted_at:s.at, status:s.status, total_score:s.score, feedback:s.feedback }).select().single();
  if(error) console.log("sub",s.old,error.message);
  else { subMap[s.old]=data.id; console.log("sub",s.old,"->",data.id); }
}
// 7. answers
const ans=[
  { sub:"s-t1-ahmad", q:"q-t1", text:null, path:"submissions/u-ahmad/a-tugas1/ans-t1-ahmad.pdf", name:"jawaban_ahmad_basisdat1.pdf", type:"application/pdf", size:184320, score:85 },
  { sub:"s-t1-rina", q:"q-t1", text:null, path:"submissions/u-rina/a-tugas1/ans-t1-rina.pdf", name:"jawaban_rina_tugas1.pdf", type:"application/pdf", size:221184, score:90 },
  { sub:"s-quiz-rina", q:"q-pg1", text:"A", path:null, name:null, type:null, size:null, score:null },
  { sub:"s-quiz-rina", q:"q-essay1", text:"HTML adalah bahasa markup untuk menyusun struktur halaman web. Contoh penggunaannya: menandai judul dengan <h1> dan membuat paragraf dengan <p>.", path:null, name:null, type:null, size:null, score:null },
  { sub:"s-quiz-rina", q:"q-essay2", text:null, path:"submissions/u-rina/a-quiz/ans-q-rina3.pdf", name:"jawaban_rina_html.pdf", type:"application/pdf", size:150732, score:null },
];
for(const a of ans){
  const { error } = await admin.from("answers").insert({ submission_id:subMap[a.sub], question_id:qMap[a.q], answer_text:a.text, file_path:a.path, file_name:a.name, file_type:a.type, file_size:a.size, score:a.score });
  if(error) console.log("ans",a.q,error.message);
}
console.log("answers OK");
console.log("DONE", JSON.stringify({ courseMap, assignMap }, null, 2));
