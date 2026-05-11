"use client";
import React, { useRef, useEffect, useState } from "react";

// ========= Kiểu dữ liệu từ Prisma =========
interface DrugIngredient {
  id: string;
  ingredientName: string;
  amount: string | null;
  sortOrder: number | null;
}

interface DrugInfoSection {
  id: string;
  sectionType: string;
  subtitle: string | null;
  content: string | null;
}

interface DrugInfoData {
  id: string;
  drugName: string;
  compositionSubtitle: string | null;
  usageSectionTitle: string | null;
  usageInstructionsTitle: string | null;
  sideEffectsTitle: string | null;
  warningsMainNoteTitle: string | null;
  warningsIntroText: string | null;
  storageTitle: string | null;
  ingredients: DrugIngredient[];
  sections: DrugInfoSection[];
}

// Nhóm section theo tab
const SECTION_GROUPS: { key: string; label: string; sectionTypes: string[] }[] = [
  {
    key: "compositionSection",
    label: "Thành phần",
    sectionTypes: [],
  },
  {
    key: "usageSection",
    label: "Công dụng",
    sectionTypes: ["indications", "pharmacodynamics", "pharmacokinetics"],
  },
  {
    key: "usageInstructions",
    label: "Cách dùng",
    sectionTypes: ["how_to_use", "dosage", "overdose", "missed_dose"],
  },
  {
    key: "sideEffects",
    label: "Tác dụng phụ",
    sectionTypes: ["side_effects"],
  },
  {
    key: "warningsAndPrecautions",
    label: "Lưu ý",
    sectionTypes: [
      "contraindications",
      "precautions",
      "driving_and_machinery",
      "pregnancy",
      "breastfeeding",
      "drug_interactions",
    ],
  },
  {
    key: "storage",
    label: "Bảo quản",
    sectionTypes: ["storage"],
  },
];

const SECTION_TYPE_LABELS: Record<string, string> = {
  indications: "Chỉ định",
  pharmacodynamics: "Dược lực học",
  pharmacokinetics: "Dược động học",
  how_to_use: "Cách dùng",
  dosage: "Liều dùng",
  overdose: "Làm gì khi dùng quá liều?",
  missed_dose: "Làm gì khi quên 1 liều?",
  side_effects: "Tác dụng phụ",
  contraindications: "Chống chỉ định",
  precautions: "Thận trọng",
  driving_and_machinery: "Lái xe và vận hành máy móc",
  pregnancy: "Phụ nữ mang thai",
  breastfeeding: "Phụ nữ cho con bú",
  drug_interactions: "Tương tác thuốc",
  storage: "Bảo quản",
};

interface Props {
  info: DrugInfoData | null;
}

const ProductInfo = ({ info }: Props) => {
  const sectionRefs = {
    compositionSection: useRef<HTMLDivElement>(null),
    usageSection: useRef<HTMLDivElement>(null),
    usageInstructions: useRef<HTMLDivElement>(null),
    sideEffects: useRef<HTMLDivElement>(null),
    warningsAndPrecautions: useRef<HTMLDivElement>(null),
    storage: useRef<HTMLDivElement>(null),
  };

  const [activeTab, setActiveTab] = useState<string>("compositionSection");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const offsets = SECTION_GROUPS.map((t) => {
        const ref = sectionRefs[t.key as keyof typeof sectionRefs];
        if (!ref.current) return { key: t.key, offset: Infinity };
        const rect = ref.current.getBoundingClientRect();
        return { key: t.key, offset: Math.abs(rect.top - 80) };
      });
      const min = offsets.reduce(
        (prev, curr) => (curr.offset < prev.offset ? curr : prev),
        offsets[0]
      );
      setActiveTab(min.key);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!info) return null;

  // Kiểm tra có dữ liệu thực sự không
  const hasIngredients = info.ingredients && info.ingredients.length > 0;
  const hasSections = info.sections && info.sections.length > 0;
  const hasAnyData = hasIngredients || hasSections || info.drugName;

  const scrollToSection = (key: keyof typeof sectionRefs) => {
    setActiveTab(key);
    sectionRefs[key]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Lấy sections theo sectionType
  const getSectionsByTypes = (types: string[]): DrugInfoSection[] => {
    if (!hasSections) return [];
    return info.sections.filter((s) => types.includes(s.sectionType));
  };

  return (
    <div className="flex bg-white rounded-xl p-5 max-md:pl-0">
      {/* Sidebar chỉ mục */}
      <div className="w-48 flex-shrink-0 sticky top-4 h-fit hidden md:block">
        <ul className="flex flex-col gap-2">
          {SECTION_GROUPS.map((t) => (
            <li
              key={t.key}
              className={`cursor-pointer px-4 py-2 rounded font-medium text-xl text-gray-500 transition border-b-2 border-[#edf0f2] ${
                activeTab === t.key
                  ? "bg-[#edf0f2] font-bold text-blue-700 rounded-md text-gray-900"
                  : "hover:bg-gray-100 hover:text-gray-900 rounded-md"
              }`}
              onClick={() => scrollToSection(t.key as keyof typeof sectionRefs)}
            >
              {t.label}
            </li>
          ))}
        </ul>
      </div>

      {/* Nội dung */}
      <div className="flex-1 pl-8 relative">
        <div
          style={
            expanded
              ? { maxHeight: "none", overflow: "visible" }
              : {
                  maxHeight: 350,
                  overflow: "hidden",
                  position: "relative",
                  transition: "max-height 0.3s",
                }
          }
        >
          {/* ===== Thành phần ===== */}
          <div ref={sectionRefs.compositionSection} id="compositionSection" className="mb-8 scroll-mt-24">
            <h2 className="font-bold text-xl mb-4">{info.drugName}</h2>
            {info.compositionSubtitle && (
              <div className="text-gray-600/80 mb-4 font-semibold">{info.compositionSubtitle}</div>
            )}
            {hasIngredients ? (
              <table className="lg:w-2/3 w-full mb-4 overflow-hidden rounded-md">
                <thead>
                  <tr className="bg-gray-300 overflow-hidden rounded-full border-b-2 border-white">
                    <th className="p-2 pl-4 text-left">Thông tin thành phần</th>
                    <th className="p-2 pr-4 text-right border-l-2 border-white">Hàm lượng</th>
                  </tr>
                </thead>
                <tbody>
                  {info.ingredients.map((ing) => (
                    <tr key={ing.id} className="border-b-2 border-white bg-[#edf0f2]">
                      <td className="p-2 pl-4">{ing.ingredientName}</td>
                      <td className="p-2 pr-4 text-right border-l-2 border-white">{ing.amount || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-400 italic text-sm">Chưa có thông tin thành phần.</p>
            )}
          </div>

          {/* ===== Công dụng ===== */}
          <div ref={sectionRefs.usageSection} id="usageSection" className="mb-8 scroll-mt-24">
            <h2 className="font-bold text-xl mb-4">{info.usageSectionTitle || "Công dụng"}</h2>
            {getSectionsByTypes(["indications", "pharmacodynamics", "pharmacokinetics"]).length > 0 ? (
              getSectionsByTypes(["indications", "pharmacodynamics", "pharmacokinetics"]).map((sec) => (
                <div key={sec.id} className="mb-4">
                  <h3 className="font-semibold mt-2 mb-2">
                    {sec.subtitle || SECTION_TYPE_LABELS[sec.sectionType]}
                  </h3>
                  <div
                    className="text-gray-700 drug-info-content"
                    dangerouslySetInnerHTML={{ __html: sec.content || '' }}
                  />
                </div>
              ))
            ) : (
              <p className="text-gray-400 italic text-sm">Chưa có thông tin công dụng.</p>
            )}
          </div>

          {/* ===== Cách dùng ===== */}
          <div ref={sectionRefs.usageInstructions} id="usageInstructions" className="mb-8 scroll-mt-24">
            <h2 className="font-bold text-xl mb-4">{info.usageInstructionsTitle || "Cách dùng"}</h2>
            {getSectionsByTypes(["how_to_use", "dosage", "overdose", "missed_dose"]).length > 0 ? (
              getSectionsByTypes(["how_to_use", "dosage", "overdose", "missed_dose"]).map((sec) => (
                <div key={sec.id} className="mb-4">
                  <h3 className="font-semibold mt-2 mb-2">
                    {sec.subtitle || SECTION_TYPE_LABELS[sec.sectionType]}
                  </h3>
                  <div
                    className="text-gray-700 drug-info-content"
                    dangerouslySetInnerHTML={{ __html: sec.content || '' }}
                  />
                </div>
              ))
            ) : (
              <p className="text-gray-400 italic text-sm">Chưa có thông tin cách dùng.</p>
            )}
          </div>

          {/* ===== Tác dụng phụ ===== */}
          <div ref={sectionRefs.sideEffects} id="sideEffects" className="mb-8 scroll-mt-24">
            <h2 className="font-bold text-xl mb-4">{info.sideEffectsTitle || "Tác dụng phụ"}</h2>
            {getSectionsByTypes(["side_effects"]).length > 0 ? (
              getSectionsByTypes(["side_effects"]).map((sec) => (
                <div key={sec.id}>
                  {sec.subtitle && <h3 className="font-semibold mb-2">{sec.subtitle}</h3>}
                  <div
                    className="text-gray-700 drug-info-content"
                    dangerouslySetInnerHTML={{ __html: sec.content || '' }}
                  />
                </div>
              ))
            ) : (
              <p className="text-gray-400 italic text-sm">Chưa có thông tin tác dụng phụ.</p>
            )}
          </div>

          {/* ===== Lưu ý ===== */}
          <div ref={sectionRefs.warningsAndPrecautions} id="warningsAndPrecautions" className="mb-8 scroll-mt-24">
            <div className="bg-[#fff3e0] p-4 rounded-md mb-4">
              <div className="font-bold text-yellow-500 flex text-2xl items-center mt-1 mb-2">
                <span style={{ fontSize: 20, marginRight: 8 }}>⚠️</span>
                {info.warningsMainNoteTitle || "Lưu ý"}
              </div>
              {info.warningsIntroText && (
                <div
                  className="text-gray-700 mb-3 drug-info-content"
                  dangerouslySetInnerHTML={{ __html: info.warningsIntroText }}
                />
              )}
              {getSectionsByTypes([
                "contraindications", "precautions", "driving_and_machinery",
                "pregnancy", "breastfeeding", "drug_interactions",
              ]).length > 0 ? (
                getSectionsByTypes([
                  "contraindications", "precautions", "driving_and_machinery",
                  "pregnancy", "breastfeeding", "drug_interactions",
                ]).map((sec) => (
                  <div key={sec.id} className="mb-3">
                    <div className="font-semibold mt-3 mb-1">
                      {sec.subtitle || SECTION_TYPE_LABELS[sec.sectionType]}
                    </div>
                    <div
                      className="text-gray-700 drug-info-content"
                      dangerouslySetInnerHTML={{ __html: sec.content || '' }}
                    />
                  </div>
                ))
              ) : (
                <p className="text-gray-400 italic text-sm">Chưa có thông tin lưu ý.</p>
              )}
            </div>
          </div>

          {/* ===== Bảo quản ===== */}
          <div ref={sectionRefs.storage} id="storage" className="mb-8 scroll-mt-24">
            <h2 className="font-bold text-xl mb-2">{info.storageTitle || "Bảo quản"}</h2>
            {getSectionsByTypes(["storage"]).length > 0 ? (
              getSectionsByTypes(["storage"]).map((sec) => (
                <div key={sec.id}>
                  {sec.subtitle && <h3 className="font-semibold mb-2">{sec.subtitle}</h3>}
                  <div
                    className="text-gray-700 drug-info-content"
                    dangerouslySetInnerHTML={{ __html: sec.content || '' }}
                  />
                </div>
              ))
            ) : (
              <p className="text-gray-400 italic text-sm">Chưa có thông tin bảo quản.</p>
            )}
          </div>

          {/* Gradient fade */}
          {!expanded && (
            <div
              style={{
                position: "absolute",
                left: 0, right: 0, bottom: 0,
                height: 80,
                background: "linear-gradient(to top, #fff, rgba(255,255,255,0))",
                pointerEvents: "none",
              }}
            />
          )}
        </div>

        {/* Nút xem thêm/thu gọn */}
        <div className="flex justify-center mt-2 mb-4">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-2 text-base font-medium focus:outline-none"
          >
            {expanded ? (
              <>
                <span style={{ fontSize: 18 }}><i className="fi fi-br-chevron-double-up text-base text-xs"></i></span> Thu gọn
              </>
            ) : (
              <>
                <span style={{ fontSize: 18 }}><i className="fi fi-br-chevron-double-down text-base text-xs"></i></span> Xem thêm
              </>
            )}
          </button>
        </div>

        {/* Box cảnh báo */}
        <div className="mt-2 mb-2 p-3 bg-blue-50 rounded-md flex items-center" style={{ borderLeft: "5px solid #1976d2" }}>
          <span className="text-blue-600 text-sm">
            Mọi thông tin trên đây chỉ mang tính chất tham khảo. Việc sử dụng thuốc phải tuân theo hướng dẫn của bác sĩ chuyên môn.
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
