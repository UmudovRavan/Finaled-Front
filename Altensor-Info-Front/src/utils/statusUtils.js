// statusUtils.js - Centralized status and dropdown localization for Altensor CRM

export const leadStatusMap = {
  'New': { az: 'Yeni', en: 'New', ru: 'Новый' },
  'Lead': { az: 'Lid', en: 'Lead', ru: 'Лид' },
  'Open': { az: 'Açıq', en: 'Open', ru: 'Открыт' },
  'Contacted': { az: 'Əlaqə saxlanıldı', en: 'Contacted', ru: 'Связались' },
  'Replied': { az: 'Cavablandı', en: 'Replied', ru: 'Отвечено' },
  'Nurture': { az: 'İnkişaf etdirilən', en: 'Nurture', ru: 'Развиваемый' },
  'Opportunity': { az: 'İmkan', en: 'Opportunity', ru: 'Возможность' },
  'Qualified': { az: 'Uyğun', en: 'Qualified', ru: 'Квалифицирован' },
  'Quotation': { az: 'Təklif', en: 'Quotation', ru: 'Предложение' },
  'Lost Quotation': { az: 'İtirilmiş Təklif', en: 'Lost Quotation', ru: 'Утерянное предложение' },
  'Interested': { az: 'Maraqlı', en: 'Interested', ru: 'Заинтересован' },
  'Converted': { az: 'Çevrildi', en: 'Converted', ru: 'Конвертирован' },
  'Unqualified': { az: 'Uyğun Olmayan', en: 'Unqualified', ru: 'Не квалифицирован' },
  'Junk': { az: 'Yararsız', en: 'Junk', ru: 'Спам / Не целевой' },
  'Do Not Contact': { az: 'Əlaqə saxlamayın', en: 'Do Not Contact', ru: 'Не связываться' },
  'Lost': { az: 'İtirildi', en: 'Lost', ru: 'Утерян' }
};

export const dealStatusMap = {
  'Qualification': { az: 'Kvalifikasiya', en: 'Qualification', ru: 'Квалификация' },
  'Demo/Making': { az: 'Demo / Hazırlıq', en: 'Demo/Making', ru: 'Демо / Подготовка' },
  'Demo': { az: 'Demo', en: 'Demo', ru: 'Демо' },
  'Proposal/Quotation': { az: 'Təklif / Qiymət', en: 'Proposal/Quotation', ru: 'Предложение / Смета' },
  'Proposal': { az: 'Təklif', en: 'Proposal', ru: 'Предложение' },
  'Negotiation': { az: 'Danışıqlar', en: 'Negotiation', ru: 'Переговоры' },
  'Ready to Close': { az: 'Bağlanmağa Hazır', en: 'Ready to Close', ru: 'Готов к закрытию' },
  'ReadyToClose': { az: 'Bağlanmağa Hazır', en: 'Ready to Close', ru: 'Готов к закрытию' },
  'Won': { az: 'Qazanıldı', en: 'Won', ru: 'Выиграно' },
  'Lost': { az: 'İtirildi', en: 'Lost', ru: 'Проиграно' }
};

export const taskStatusMap = {
  'Pending': { az: 'Gözləyir', en: 'Pending', ru: 'В ожидании' },
  'Backlog': { az: 'Gözləmədə', en: 'Backlog', ru: 'Бэклог' },
  'To Do': { az: 'Görüləcək', en: 'To Do', ru: 'Сделать' },
  'ToDo': { az: 'Görüləcək', en: 'To Do', ru: 'Сделать' },
  'In Progress': { az: 'İcrada', en: 'In Progress', ru: 'В процессе' },
  'InProgress': { az: 'İcrada', en: 'In Progress', ru: 'В процессе' },
  'Completed': { az: 'Tamamlandı', en: 'Completed', ru: 'Завершено' },
  'Done': { az: 'Tamamlandı', en: 'Done', ru: 'Готово' },
  'Canceled': { az: 'Ləğv edildi', en: 'Canceled', ru: 'Отменено' }
};

export const priorityMap = {
  'Low': { az: 'Aşağı', en: 'Low', ru: 'Низкий' },
  'Medium': { az: 'Orta', en: 'Medium', ru: 'Средний' },
  'High': { az: 'Yüksək', en: 'High', ru: 'Высокий' },
  'Urgent': { az: 'Təcili', en: 'Urgent', ru: 'Срочный' }
};

export const callTypeMap = {
  'Outgoing': { az: 'Xaric olan', en: 'Outgoing', ru: 'Исходящий' },
  'Incoming': { az: 'Daxil olan', en: 'Incoming', ru: 'Входящий' }
};

export const callStatusMap = {
  'Initiated': { az: 'Başladıldı', en: 'Initiated', ru: 'Инициирован' },
  'Ringing': { az: 'Zəng gedir', en: 'Ringing', ru: 'Идет звонок' },
  'In Progress': { az: 'Danışıq gedir', en: 'In Progress', ru: 'В процессе' },
  'Completed': { az: 'Tamamlandı', en: 'Completed', ru: 'Завершено' },
  'Failed': { az: 'Uğursuz', en: 'Failed', ru: 'Неудачно' },
  'Busy': { az: 'Məşğul', en: 'Busy', ru: 'Занято' },
  'No Answer': { az: 'Cavabsız', en: 'No Answer', ru: 'Нет ответа' },
  'Missed': { az: 'Cavabsız', en: 'Missed', ru: 'Пропущенный' },
  'Queued': { az: 'Növbədə', en: 'Queued', ru: 'В очереди' },
  'Scheduled': { az: 'Planlaşdırıldı', en: 'Scheduled', ru: 'Запланировано' },
  'Canceled': { az: 'Ləğv edildi', en: 'Canceled', ru: 'Отменено' }
};

export const genderMap = {
  'Male': { az: 'Kişi', en: 'Male', ru: 'Мужской' },
  'Female': { az: 'Qadın', en: 'Female', ru: 'Женский' },
  'Other': { az: 'Digər', en: 'Other', ru: 'Другой' },
  'Genderqueer': { az: 'Qeyri-binar', en: 'Genderqueer', ru: 'Гендерквир' },
  'Non-Conforming': { az: 'Qeyri-standart', en: 'Non-Conforming', ru: 'Неконформный' },
  'Prefer not to say': { az: 'Qeyd etmək istəmirəm', en: 'Prefer not to say', ru: 'Не указывать' },
  'Transgender': { az: 'Transgender', en: 'Transgender', ru: 'Трансгендер' }
};

export const salutationMap = {
  'Mr': { az: 'Cənab (Mr)', en: 'Mr', ru: 'Г-н (Mr)' },
  'Mrs': { az: 'Xanım (Mrs)', en: 'Mrs', ru: 'Г-жа (Mrs)' },
  'Ms': { az: 'Xanım (Ms)', en: 'Ms', ru: 'Г-жа (Ms)' },
  'Miss': { az: 'Xanım (Miss)', en: 'Miss', ru: 'Мисс (Miss)' },
  'Dr': { az: 'Dr.', en: 'Dr', ru: 'Д-р' },
  'Madam': { az: 'Madam', en: 'Madam', ru: 'Мадам' },
  'Master': { az: 'Master', en: 'Master', ru: 'Мастер' }
};

export const sourceMap = {
  'Advertisement': { az: 'Reklam', en: 'Advertisement', ru: 'Реклама' },
  'Campaign': { az: 'Kampaniya', en: 'Campaign', ru: 'Кампания' },
  'Cold Calling': { az: 'Soyuq zənglər', en: 'Cold Calling', ru: 'Холодные звонки' },
  "Customer's Vendor": { az: 'Müştərinin təchizatçısı', en: "Customer's Vendor", ru: 'Поставщик клиента' },
  'Email': { az: 'E-poçt', en: 'Email', ru: 'Электронная почта' },
  'Exhibition': { az: 'Sərgi', en: 'Exhibition', ru: 'Выставка' },
  'Existing Customer': { az: 'Mövcud müştəri', en: 'Existing Customer', ru: 'Существующий клиент' },
  'Facebook': { az: 'Facebook', en: 'Facebook', ru: 'Facebook' },
  'Mass Mailing': { az: 'Kütləvi poçt göndərişi', en: 'Mass Mailing', ru: 'Массовая рассылка' },
  'Reference': { az: 'Tövsiyə', en: 'Reference', ru: 'Рекомендация' },
  'Supplier Reference': { az: 'Təchizatçı tövsiyəsi', en: 'Supplier Reference', ru: 'Рекомендация поставщика' },
  'Walk In': { az: 'Şəxsi müraciət', en: 'Walk In', ru: 'Личный визит' },
  'Website': { az: 'Vebsayt', en: 'Website', ru: 'Веб-сайт' }
};

export const industryMap = {
  'Accounting': { az: 'Mühasibatlıq', en: 'Accounting', ru: 'Бухгалтерия' },
  'Advertising': { az: 'Reklam və Marketinq', en: 'Advertising', ru: 'Реклама' },
  'Aerospace': { az: 'Aviasiya və Kosmos', en: 'Aerospace', ru: 'Аэрокосмическая отрасль' },
  'Agriculture': { az: 'Kənd təsərrüfatı', en: 'Agriculture', ru: 'Сельское хозяйство' },
  'Airline': { az: 'Hava yolları', en: 'Airline', ru: 'Авиалинии' },
  'Apparel & Accessories': { az: 'Geyim və Aksesuarlar', en: 'Apparel & Accessories', ru: 'Одежда и аксессуары' },
  'Automotive': { az: 'Avtomobil', en: 'Automotive', ru: 'Автомобилестроение' },
  'Technology': { az: 'Texnologiya & İT', en: 'Technology', ru: 'Технологии & IT' },
  'Finance': { az: 'Maliyyə və Bank', en: 'Finance', ru: 'Финансы и банкинг' },
  'Healthcare': { az: 'Səhiyyə və Tibb', en: 'Healthcare', ru: 'Здравоохранение' },
  'Real Estate': { az: 'Daşınmaz əmlak', en: 'Real Estate', ru: 'Недвижимость' },
  'Education': { az: 'Təhsil', en: 'Education', ru: 'Образование' },
  'Other': { az: 'Digər', en: 'Other', ru: 'Другое' }
};

export const territoryMap = {
  'Azerbaijan': { az: 'Azərbaycan', en: 'Azerbaijan', ru: 'Азербайджан' },
  'Turkey': { az: 'Türkiyə', en: 'Turkey', ru: 'Турция' },
  'United States': { az: 'ABŞ', en: 'United States', ru: 'США' },
  'Global': { az: 'Qlobal', en: 'Global', ru: 'Глобальный' }
};

export const getLeadStatusLabel = (status, language = 'az') => {
  if (!status) return '';
  const item = leadStatusMap[status];
  return item ? item[language] || item.en || status : status;
};

export const getDealStatusLabel = (status, language = 'az') => {
  if (!status) return '';
  const item = dealStatusMap[status];
  return item ? item[language] || item.en || status : status;
};

export const getTaskStatusLabel = (status, language = 'az') => {
  if (!status) return '';
  const item = taskStatusMap[status];
  return item ? item[language] || item.en || status : status;
};

export const getPriorityLabel = (priority, language = 'az') => {
  if (!priority) return '';
  const item = priorityMap[priority];
  return item ? item[language] || item.en || priority : priority;
};

export const getCallTypeLabel = (type, language = 'az') => {
  if (!type) return '';
  const item = callTypeMap[type];
  return item ? item[language] || item.en || type : type;
};

export const getCallStatusLabel = (status, language = 'az') => {
  if (!status) return '';
  const item = callStatusMap[status];
  return item ? item[language] || item.en || status : status;
};

export const getGenderLabel = (gender, language = 'az') => {
  if (!gender) return '';
  const item = genderMap[gender];
  return item ? item[language] || item.en || gender : gender;
};

export const getSalutationLabel = (salutation, language = 'az') => {
  if (!salutation) return '';
  const item = salutationMap[salutation];
  return item ? item[language] || item.en || salutation : salutation;
};

export const getSourceLabel = (source, language = 'az') => {
  if (!source) return '';
  const item = sourceMap[source];
  return item ? item[language] || item.en || source : source;
};

export const getIndustryLabel = (industry, language = 'az') => {
  if (!industry) return '';
  const item = industryMap[industry];
  return item ? item[language] || item.en || industry : industry;
};

export const getTerritoryLabel = (territory, language = 'az') => {
  if (!territory) return '';
  const item = territoryMap[territory];
  return item ? item[language] || item.en || territory : territory;
};

// Generic status resolver
export const getLocalizedStatus = (status, language = 'az') => {
  if (!status) return '';
  return (
    leadStatusMap[status]?.[language] ||
    dealStatusMap[status]?.[language] ||
    taskStatusMap[status]?.[language] ||
    priorityMap[status]?.[language] ||
    callTypeMap[status]?.[language] ||
    callStatusMap[status]?.[language] ||
    genderMap[status]?.[language] ||
    salutationMap[status]?.[language] ||
    sourceMap[status]?.[language] ||
    industryMap[status]?.[language] ||
    territoryMap[status]?.[language] ||
    status
  );
};
