"use client";
import Image from "next/image";
import { useState } from "react";
import { products } from "@/lib/products";

type Scene = { bg: string; floor: string; art: JSX.Element };
const scenes: Record<string, Scene> = {
  "panci-besi-cor-24cm": { bg: "#E8E6E1", floor: "#D5D2CB", art: (<g>
    <rect x="22" y="44" width="56" height="30" rx="5" fill="#2A2C2B" /><ellipse cx="50" cy="44" rx="29" ry="6" fill="#3A3D3B" />
    <path d="M24 40c2-10 50-10 52 0z" fill="#1F2120" /><rect x="46" y="29" width="8" height="5" rx="2" fill="#1F2120" />
    <rect x="14" y="50" width="9" height="5" rx="2.5" fill="#2A2C2B" /><rect x="77" y="50" width="9" height="5" rx="2.5" fill="#2A2C2B" />
    <path d="M30 52v14" stroke="#4A4D4B" strokeWidth="2" strokeLinecap="round" /></g>) },
  "talenan-jati-besar": { bg: "#ECE7DF", floor: "#DAD2C5", art: (<g>
    <rect x="30" y="16" width="40" height="66" rx="9" fill="#B58B5C" /><rect x="30" y="16" width="40" height="66" rx="9" fill="none" stroke="#9C7549" strokeWidth="1.5" />
    <circle cx="50" cy="24" r="3.5" fill="#ECE7DF" /><path d="M38 38c4 6 4 14 0 22M48 34c4 8 4 18 0 28M58 40c3 6 3 12 0 20M42 66c3 3 8 3 14 0" stroke="#9C7549" strokeWidth="1.2" fill="none" strokeLinecap="round" /></g>) },
  "set-piring-keramik-6": { bg: "#EAE8E3", floor: "#D8D5CD", art: (<g>
    <ellipse cx="50" cy="64" rx="34" ry="9" fill="#C9C6BC" /><ellipse cx="50" cy="61" rx="34" ry="9" fill="#DAD7CD" />
    <ellipse cx="50" cy="55" rx="34" ry="9" fill="#C9C6BC" /><ellipse cx="50" cy="52" rx="34" ry="9" fill="#E4E1D8" />
    <ellipse cx="50" cy="46" rx="34" ry="9" fill="#C9C6BC" /><ellipse cx="50" cy="43" rx="34" ry="9" fill="#EFECE4" /><ellipse cx="50" cy="43" rx="22" ry="5.5" fill="#E2DFD6" /></g>) },
  "gelas-kaca-tiup-4": { bg: "#E3E9E8", floor: "#CFD8D6", art: (<g>
    <path d="M26 34h20l-3 42a4 4 0 0 1-4 3h-6a4 4 0 0 1-4-3z" fill="#9FBFBA" opacity=".75" /><path d="M26 34h20" stroke="#fff" strokeWidth="2" opacity=".7" />
    <path d="M52 28h22l-3 48a4 4 0 0 1-4 3h-8a4 4 0 0 1-4-3z" fill="#B7D0CC" opacity=".8" /><path d="M52 28h22" stroke="#fff" strokeWidth="2" opacity=".7" />
    <path d="M58 36v34" stroke="#fff" strokeWidth="2" opacity=".5" strokeLinecap="round" /></g>) },
  "vas-terakota-tinggi": { bg: "#EFE6DF", floor: "#DDCFC4", art: (<g>
    <path d="M42 14h16l-2 14c14 8 20 20 17 36-1 8-6 16-24 16s-23-8-24-16c-3-16 3-28 17-36z" fill="#B3694A" />
    <ellipse cx="50" cy="14" rx="8" ry="2.5" fill="#8F4F36" /><path d="M32 60c10 4 26 4 36 0" stroke="#9A573C" strokeWidth="1.5" fill="none" /></g>) },
  "sarung-bantal-linen": { bg: "#ECEAE4", floor: "#DAD6CB", art: (<g>
    <rect x="20" y="22" width="60" height="58" rx="9" fill="#CFC8B4" /><path d="M20 36c20 6 40 6 60 0M26 74c16-6 32-6 48 0M32 24c-2 18 0 36 4 54" stroke="#BDB59E" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <path d="M20 22c14 4 46 4 60 0" stroke="#E2DCC9" strokeWidth="2" fill="none" /></g>) },
  "lilin-soya-cendana": { bg: "#EFE9E0", floor: "#DED5C6", art: (<g>
    <rect x="31" y="42" width="38" height="38" rx="6" fill="#E3D6C0" /><rect x="31" y="42" width="38" height="8" rx="4" fill="#CDBFA6" /><rect x="40" y="58" width="20" height="12" rx="2" fill="#F4EEE2" />
    <path d="M50 42v-8" stroke="#3A3D3B" strokeWidth="1.5" /><path d="M50 22c5 5 6 9 0 13-6-4-5-8 0-13z" fill="#E8A53C" /></g>) },
  "taplak-meja-batik-tulis": { bg: "#E4E6EA", floor: "#D1D5DC", art: (<g>
    <path d="M14 38l72-4v40l-72 6z" fill="#2F3E5C" />
    {[0, 1, 2, 3, 4].flatMap((i) => [0, 1].map((j) => <circle key={`${i}${j}`} cx={24 + i * 14} cy={48 + j * 18 - i * 0.8} r="4" fill="none" stroke="#D9C9A3" strokeWidth="1.2" />))}
    <path d="M14 38l72-4v40l-72 6z" fill="none" stroke="#D9C9A3" strokeWidth="1" /></g>) },
  "wajan-anti-lengket-28": { bg: "#E9E7E3", floor: "#D6D3CD", art: (<g>
    <path d="M20 46h52v10c0 9-52 9-52 0z" fill="#2A2C2B" />
    <ellipse cx="46" cy="46" rx="26" ry="7" fill="#3A3D3B" /><ellipse cx="46" cy="46" rx="19" ry="4.5" fill="#2A2C2B" />
    <rect x="70" y="45" width="20" height="5.5" rx="2.75" fill="#1F2120" /></g>) },
  "pisau-master-chef-20": { bg: "#ECE8E1", floor: "#D9D4C9", art: (<g>
    <path d="M22 50 64 30l7 11-42 24z" fill="#C8CDD1" /><path d="M22 50 64 30l3 5-42 22z" fill="#E6EAEC" />
    <path d="M22 50l43-24" stroke="#AEB4B8" strokeWidth="1" fill="none" />
    <rect x="12" y="52" width="24" height="7" rx="3.5" transform="rotate(20 12 52)" fill="#6B4A2E" />
    <circle cx="18" cy="58" r="1.3" fill="#4E341F" /><circle cx="26" cy="55" r="1.3" fill="#4E341F" /></g>) },
  "wadah-bumbu-3": { bg: "#EFEADD", floor: "#DCD5C4", art: (<g>
    {[0, 1, 2].map((i) => (<g key={i} transform={`translate(${22 + i * 22} 38)`}>
      <rect x="0" y="0" width="15" height="36" rx="4" fill="#D8CBB0" /><rect x="0" y="0" width="15" height="7" rx="3" fill="#B9A882" />
      <rect x="1.5" y="12" width="12" height="20" rx="2" fill={["#C7A46B", "#B7C49A", "#C88F76"][i]} /></g>))}</g>) },
  "sutil-sendok-kayu": { bg: "#EEE9E0", floor: "#DCD4C6", art: (<g>
    <path d="M38 52h24l-3 22a4 4 0 0 1-4 4H45a4 4 0 0 1-4-4z" fill="#B58B5C" /><path d="M38 52h24" stroke="#9C7549" strokeWidth="1.5" />
    <rect x="46" y="20" width="5" height="32" rx="2.5" fill="#C39B6B" /><ellipse cx="48.5" cy="20" rx="6" ry="4" fill="#C39B6B" />
    <rect x="56" y="27" width="4.5" height="25" rx="2.25" fill="#B58B5C" transform="rotate(9 56 27)" /><ellipse cx="58" cy="27" rx="5" ry="3.5" fill="#B58B5C" transform="rotate(9 58 27)" /></g>) },
  "mangkuk-keramik-4": { bg: "#EDEAE4", floor: "#DAD6CC", art: (<g>
    <path d="M22 52h56c-4 17-15 26-28 26S26 69 22 52z" fill="#D7CFC2" /><ellipse cx="50" cy="52" rx="28" ry="7" fill="#E6E0D4" />
    <path d="M30 40h40c-3 11-11 17-20 17s-17-6-20-17z" fill="#C9C1B2" /><ellipse cx="50" cy="40" rx="20" ry="5" fill="#DCD5C8" /></g>) },
  "teko-keramik": { bg: "#EFEBE3", floor: "#DDD7CB", art: (<g>
    <path d="M30 46h40c2 18-8 28-20 28S28 64 30 46z" fill="#C6BBA8" /><ellipse cx="50" cy="46" rx="20" ry="5.5" fill="#D7CDBA" />
    <path d="M50 41c0-6 7-8 7-2" stroke="#B7AB96" strokeWidth="4" fill="none" strokeLinecap="round" />
    <path d="M70 52c11 0 13 13 2 15" stroke="#C6BBA8" strokeWidth="5" fill="none" strokeLinecap="round" />
    <path d="M30 52c-9 4-9 15 2 17" stroke="#C6BBA8" strokeWidth="5" fill="none" strokeLinecap="round" /></g>) },
  "set-alat-makan-16": { bg: "#ECECEC", floor: "#D8D8D8", art: (<g>
    <rect x="26" y="28" width="4" height="48" rx="2" fill="#C2C7CB" /><ellipse cx="28" cy="24" rx="6" ry="8" fill="#C2C7CB" />
    <rect x="48" y="28" width="4" height="48" rx="2" fill="#B9BEC2" /><path d="M42 26h16M42 32h16" stroke="#B9BEC2" strokeWidth="3" strokeLinecap="round" /><path d="M43 20v8M50 20v8M57 20v8" stroke="#B9BEC2" strokeWidth="3" strokeLinecap="round" />
    <rect x="66" y="26" width="4" height="50" rx="2" fill="#C2C7CB" /><path d="M66 18c9 0 9 10 0 10z" fill="#C2C7CB" /></g>) },
  "nampan-saji-jati": { bg: "#EEE7DC", floor: "#DBCFBD", art: (<g>
    <rect x="16" y="34" width="68" height="42" rx="9" fill="#B58B5C" /><rect x="22" y="40" width="56" height="30" rx="5" fill="#C39B6B" />
    <ellipse cx="50" cy="55" rx="15" ry="8.5" fill="#E4DED2" /><ellipse cx="50" cy="53" rx="15" ry="8.5" fill="#EFEAE0" />
    <ellipse cx="50" cy="51" rx="9" ry="4.5" fill="#E2DCD0" /></g>) },
  "cermin-dinding-bulat": { bg: "#E7E9EA", floor: "#D3D6D8", art: (<g>
    <circle cx="50" cy="50" r="30" fill="#B58B5C" /><circle cx="50" cy="50" r="26" fill="#C7D6DA" />
    <path d="M36 40c8-7 20-7 28 0" stroke="#fff" strokeWidth="3" fill="none" opacity=".75" strokeLinecap="round" />
    <path d="M42 62l14-18" stroke="#fff" strokeWidth="2" fill="none" opacity=".5" /></g>) },
  "lampu-meja-rotan": { bg: "#EFE9DF", floor: "#DDD4C5", art: (<g>
    <path d="M30 38h40l-8 28H38z" fill="#C79A5E" /><path d="M30 38h40" stroke="#A87C43" strokeWidth="2" />
    {[0, 1, 2].map((i) => <path key={i} d={`M${34 + i * 4} 42h${30 - i * 8}`} stroke="#B98A4C" strokeWidth="1.4" />)}
    <circle cx="50" cy="54" r="5" fill="#F4DDA6" /><rect x="47" y="66" width="6" height="9" fill="#8A6A44" />
    <ellipse cx="50" cy="75" rx="12" ry="3.5" fill="#7A5C39" /></g>) },
  "bingkai-foto-set-3": { bg: "#EBE8E2", floor: "#D8D4CC", art: (<g>
    <rect x="16" y="36" width="26" height="34" rx="2" fill="#8E8577" /><rect x="20" y="40" width="18" height="26" fill="#D8D3C8" />
    <rect x="40" y="26" width="24" height="32" rx="2" fill="#A79C8B" /><rect x="44" y="30" width="16" height="24" fill="#E4E0D6" />
    <rect x="60" y="38" width="24" height="32" rx="2" fill="#7E7566" /><rect x="63" y="42" width="18" height="24" fill="#D2CDC1" /></g>) },
  "pot-tanaman-terakota": { bg: "#EEE6DF", floor: "#DCCDC1", art: (<g>
    <path d="M50 46V30" stroke="#4E6640" strokeWidth="2" />
    <path d="M50 46c-2-11-13-13-15-22 9 2 13 9 13 15z" fill="#5E7A4E" />
    <path d="M50 46c2-13 13-15 15-24-9 2-13 9-13 16z" fill="#6E8C57" />
    <path d="M50 46c-6-6-16-4-20-10 9-1 15 4 18 9z" fill="#4E6640" />
    <rect x="34" y="46" width="32" height="9" rx="3" fill="#A85B3D" /><path d="M36 55h28l-4 20H40z" fill="#B96A4A" /></g>) },
  "seprai-katun-180": { bg: "#E6E9EC", floor: "#D3D7DB", art: (<g>
    <rect x="18" y="38" width="64" height="13" rx="3" fill="#7C8B9A" /><rect x="20" y="49" width="60" height="13" rx="3" fill="#8E9DAB" />
    <rect x="22" y="60" width="56" height="12" rx="3" fill="#A1AEBB" /><path d="M18 44c22 4 42 4 64 0M20 55c20-4 40-4 60 0" stroke="#697888" strokeWidth="1" fill="none" /></g>) },
  "selimut-anyaman": { bg: "#EEE9DF", floor: "#DAD2C2", art: (<g>
    <path d="M20 74l12-4M40 74l12-4M60 74l12-4" stroke="#B0A184" strokeWidth="2" strokeLinecap="round" />
    <rect x="20" y="34" width="60" height="38" rx="6" fill="#B9A98C" />
    {[0, 1, 2].map((i) => <path key={i} d={`M20 ${44 + i * 10}c15 4 45 4 60 0`} stroke="#A08F70" strokeWidth="1.5" fill="none" />)}
    {[0, 1, 2, 3].map((i) => <path key={`v${i}`} d={`M${30 + i * 13} 38v32`} stroke="#C0B295" strokeWidth="1.2" />)}</g>) },
  "gorden-linen": { bg: "#E8EAE7", floor: "#D4D7D4", art: (<g>
    <rect x="16" y="14" width="68" height="5" rx="2.5" fill="#6E7568" />
    <path d="M20 19c-4 22-4 42 0 59h24c4-17 4-37 0-59z" fill="#9AA39B" />
    <path d="M56 19c4 22 4 42 0 59H80c-4-17-4-37 0-59z" fill="#8B948B" />
    <path d="M30 22v54M41 22v54M62 22v54M70 22v54" stroke="#848D84" strokeWidth="1" /></g>) },
  "diffuser-reed-100": { bg: "#EFE8DC", floor: "#DCD3C2", art: (<g>
    <path d="M40 44h20v28a4 4 0 0 1-4 4H44a4 4 0 0 1-4-4z" fill="#D8C9AE" /><rect x="44" y="35" width="12" height="11" rx="2" fill="#C6B597" />
    <path d="M48 35 39 13M52 35l5-22M50 35l11-19" stroke="#9C7B4E" strokeWidth="2" strokeLinecap="round" /></g>) },
  "lilin-amber-3": { bg: "#EFE7D8", floor: "#DED2BE", art: (<g>
    {[0, 1, 2].map((i) => (<g key={i} transform={`translate(${25 + i * 18} 46)`}>
      <rect x="0" y="0" width="12" height="26" rx="3" fill="#E0C79A" />
      <path d="M6-1c3 3 3 6 0 8-3-2-3-5 0-8z" fill="#E8A53C" /></g>))}</g>) },
  "dupa-sandalwood-40": { bg: "#EFE9E1", floor: "#DDD5C9", art: (<g>
    <ellipse cx="50" cy="63" rx="11" ry="3.5" fill="#A07C50" /><rect x="39" y="62" width="22" height="12" rx="3" fill="#8A6A44" />
    <path d="M48 60 45 22M52 60l3-32" stroke="#6B4A2E" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="45" cy="20" r="2" fill="#E8A53C" />
    <path d="M45 16c4-4-4-8 0-12M53 14c4-4-4-8 0-11" stroke="#CFC7BA" strokeWidth="1.5" fill="none" strokeLinecap="round" /></g>) },
};
export default function ProductImage({ slug, zoom = 1 }: { slug: string; zoom?: number }) {
  const s = scenes[slug] ?? scenes["panci-besi-cor-24cm"];
  const p = products.find((x) => x.slug === slug);
  const [failed, setFailed] = useState(false);
  if (p?.image && !failed) {
    return (
      <div className="relative h-full w-full overflow-hidden">
        <Image src={p.image} alt={p.name} fill
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          className="object-cover"
          style={{ transform: zoom === 1 ? undefined : `scale(${zoom})` }}
          onError={() => setFailed(true)} />
      </div>
    );
  }
  return (
    <svg viewBox="0 0 100 100" role="img" aria-label={p?.name ?? "Foto produk"} className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <rect width="100" height="100" fill={s.bg} />
      <rect y="78" width="100" height="22" fill={s.floor} />
      <g transform={`translate(${50 - 50 * zoom} ${52 - 52 * zoom}) scale(${zoom})`}>
        <ellipse cx="50" cy="82" rx="34" ry="3.5" fill="#000" opacity=".12" />
        {s.art}
      </g>
    </svg>
  );
}
