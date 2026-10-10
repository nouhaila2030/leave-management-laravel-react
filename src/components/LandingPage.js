import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState("fr");

  const content = {
    fr: {
      title: "Bienvenue sur le portail de gestion des congés.",
      subtitle: "Portail de gestion des congés — Administration publique",
      message: `Ce système a été conçu pour vous, agents et employés de l'administration publique, afin de simplifier vos démarches, valoriser votre engagement et vous offrir un espace moderne, fluide et accessible. Votre bien-être compte. Prenez soin de vous, organisez votre temps sereinement, et continuez à servir avec excellence.`,
      quote: "« Le service public ne se limite pas à une fonction, c'est une mission. »",
      login: "Se connecter",
      langToggle: "Ar",
    },
    ar: {
      title: "مرحبًا بكم في بوابة تدبير العطل.",
      subtitle: "بوابة تدبير العطل — الإدارة العمومية",
      message: `تم تصميم هذا النظام من أجلكم موظفي وعمال الإدارة العمومية 
        لتسهيل الإجراءات، وتقدير مجهوداتكم، وتوفير فضاء عصري وسلس وسهل الولوج. 
        راحتكم تهمنا. نظموا وقتكم بكل اطمئنان، وواصلوا تقديم الخدمة بإتقان.`,
      quote: "« الوظيفة العمومية ليست مجرد وظيفة، بل رسالة. »",
      login: "تسجيل الدخول",
      langToggle: "Fr",
    },
  };

  const isArabic = lang === "ar";

  useEffect(() => {
    document.body.style.backgroundColor = "#1e3a8a";
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, []);

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center py-10"
      dir={isArabic ? "rtl" : "ltr"}
      style={{
        backgroundColor: "#1e3a8a",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      {/* Bouton langue */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setLang(lang === "fr" ? "ar" : "fr")}
          className="bg-white text-blue-900 text-[11px] font-bold px-2 py-1 rounded shadow"
        >
          {content[lang].langToggle}
        </button>
      </div>

      {/* En-tête */}
      <div className="text-center mb-8">
        <h1 className="text-white text-2xl font-bold">{content[lang].subtitle}</h1>
      </div>

      {/* Bloc principal */}
      <div className="flex flex-col bg-white bg-opacity-95 rounded-lg shadow-lg overflow-hidden w-[90%] max-w-2xl">
        <div className="p-10 flex flex-col justify-center text-gray-800">
          <h2 className="text-[22px] md:text-[26px] font-bold mb-4 leading-[1.4]">
            {content[lang].title}
          </h2>
          <p className="text-[15px] leading-[1.6] mb-6 text-justify whitespace-pre-line">
            {content[lang].message}
          </p>
          <div className="italic text-gray-600 text-[14px] mb-8 leading-[1.4]">
            {content[lang].quote}
          </div>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 bg-blue-900 text-white text-[18px] font-bold rounded-lg shadow-lg hover:bg-blue-800 transition"
          >
            {content[lang].login}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
