export interface Student {
  id: number
  firstName: string
  lastName: string
  phone: string
  email: string
  telegram: string
  status: 'active' | 'paused' | 'archived'
  price: number
  duration: number
  startDate: string
  comment: string
  debt: number
}

export interface Group {
  id: number
  name: string
  members: { studentId: number; name: string }[]
  duration: number
  schedule: string
}

export interface Lesson {
  id: number
  studentId?: number
  groupId?: number
  title: string
  date: string
  time: string
  duration: number
  status: 'scheduled' | 'completed' | 'cancelled'
  price: number
}

export interface Payment {
  id: number
  studentId: number
  studentName: string
  amount: number
  date: string
  method: string
}

export interface WorkDay {
  day: string
  short: string
  enabled: boolean
  intervals: { from: string; to: string }[]
}

export function useMockData() {
  const students: Student[] = [
    { id: 1, firstName: 'Анна', lastName: 'Петрова', phone: '+7 916 123-45-67', email: 'anna.p@mail.ru', telegram: '@anna_petrova', status: 'active', price: 2000, duration: 60, startDate: '2025-09-01', comment: 'Готовится к IELTS, уровень B2', debt: 4000 },
    { id: 2, firstName: 'Михаил', lastName: 'Козлов', phone: '+7 925 234-56-78', email: 'mkozlov@gmail.com', telegram: '@m_kozlov', status: 'active', price: 1800, duration: 45, startDate: '2025-10-15', comment: 'Начальный уровень A1', debt: 0 },
    { id: 3, firstName: 'Елена', lastName: 'Сидорова', phone: '+7 903 345-67-89', email: 'elena.sid@yandex.ru', telegram: '@lenasid', status: 'active', price: 2500, duration: 90, startDate: '2025-06-10', comment: 'Бизнес-английский, презентации', debt: 2500 },
    { id: 4, firstName: 'Дмитрий', lastName: 'Волков', phone: '+7 917 456-78-90', email: 'dvolkov@mail.ru', telegram: '@dim_volkov', status: 'paused', price: 1500, duration: 60, startDate: '2025-11-01', comment: 'Приостановил до февраля', debt: 1500 },
    { id: 5, firstName: 'Ольга', lastName: 'Новикова', phone: '+7 926 567-89-01', email: 'olga.n@gmail.com', telegram: '@olga_nov', status: 'active', price: 2000, duration: 60, startDate: '2025-08-20', comment: 'Разговорный + грамматика', debt: 0 },
    { id: 6, firstName: 'Алексей', lastName: 'Морозов', phone: '+7 915 678-90-12', email: 'amorozov@yandex.ru', telegram: '@alex_moroz', status: 'active', price: 2200, duration: 60, startDate: '2026-01-10', comment: 'Подготовка к собеседованию в IT', debt: 6600 },
    { id: 7, firstName: 'Мария', lastName: 'Кузнецова', phone: '+7 909 789-01-23', email: 'maria.k@mail.ru', telegram: '@mashakuz', status: 'archived', price: 1800, duration: 45, startDate: '2025-03-01', comment: 'Завершила курс, уровень B1', debt: 0 },
    { id: 8, firstName: 'Сергей', lastName: 'Лебедев', phone: '+7 916 890-12-34', email: 'slebedev@gmail.com', telegram: '@sergey_leb', status: 'active', price: 2000, duration: 60, startDate: '2026-02-01', comment: 'Немецкий язык, уровень A2', debt: 2000 },
  ]

  const groups: Group[] = [
    { id: 1, name: 'English A1 — Beginners', members: [{ studentId: 2, name: 'Михаил Козлов' }, { studentId: 5, name: 'Ольга Новикова' }], duration: 60, schedule: 'Пн, Ср 18:00' },
    { id: 2, name: 'Business English B1+', members: [{ studentId: 1, name: 'Анна Петрова' }, { studentId: 3, name: 'Елена Сидорова' }, { studentId: 6, name: 'Алексей Морозов' }], duration: 90, schedule: 'Вт, Чт 17:00' },
    { id: 3, name: 'Разговорный клуб', members: [{ studentId: 5, name: 'Ольга Новикова' }, { studentId: 8, name: 'Сергей Лебедев' }, { studentId: 1, name: 'Анна Петрова' }], duration: 60, schedule: 'Сб 12:00' },
  ]

  const todayLessons: Lesson[] = [
    { id: 1, studentId: 1, title: 'Анна Петрова', date: '2026-04-06', time: '09:00', duration: 60, status: 'completed', price: 2000 },
    { id: 2, studentId: 3, title: 'Елена Сидорова', date: '2026-04-06', time: '10:30', duration: 90, status: 'completed', price: 2500 },
    { id: 3, groupId: 1, title: 'English A1 — Beginners', date: '2026-04-06', time: '14:00', duration: 60, status: 'scheduled', price: 0 },
    { id: 4, studentId: 6, title: 'Алексей Морозов', date: '2026-04-06', time: '16:00', duration: 60, status: 'scheduled', price: 2200 },
    { id: 5, studentId: 8, title: 'Сергей Лебедев', date: '2026-04-06', time: '18:00', duration: 60, status: 'scheduled', price: 2000 },
  ]

  const weekLessons: Lesson[] = [
    // Понедельник 06.04
    { id: 10, studentId: 1, title: 'Анна Петрова', date: '2026-04-06', time: '09:00', duration: 60, status: 'completed', price: 2000 },
    { id: 11, studentId: 3, title: 'Елена Сидорова', date: '2026-04-06', time: '10:30', duration: 90, status: 'completed', price: 2500 },
    { id: 12, groupId: 1, title: 'English A1', date: '2026-04-06', time: '14:00', duration: 60, status: 'scheduled', price: 0 },
    { id: 13, studentId: 6, title: 'Алексей Морозов', date: '2026-04-06', time: '16:00', duration: 60, status: 'scheduled', price: 2200 },
    { id: 14, studentId: 8, title: 'Сергей Лебедев', date: '2026-04-06', time: '18:00', duration: 60, status: 'scheduled', price: 2000 },
    // Вторник 07.04
    { id: 20, studentId: 2, title: 'Михаил Козлов', date: '2026-04-07', time: '09:00', duration: 45, status: 'scheduled', price: 1800 },
    { id: 21, studentId: 5, title: 'Ольга Новикова', date: '2026-04-07', time: '11:00', duration: 60, status: 'scheduled', price: 2000 },
    { id: 22, groupId: 2, title: 'Business English B1+', date: '2026-04-07', time: '17:00', duration: 90, status: 'scheduled', price: 0 },
    // Среда 08.04
    { id: 30, studentId: 1, title: 'Анна Петрова', date: '2026-04-08', time: '09:00', duration: 60, status: 'scheduled', price: 2000 },
    { id: 31, studentId: 3, title: 'Елена Сидорова', date: '2026-04-08', time: '10:30', duration: 90, status: 'scheduled', price: 2500 },
    { id: 32, groupId: 1, title: 'English A1', date: '2026-04-08', time: '14:00', duration: 60, status: 'scheduled', price: 0 },
    { id: 33, studentId: 6, title: 'Алексей Морозов', date: '2026-04-08', time: '16:00', duration: 60, status: 'scheduled', price: 2200 },
    // Четверг 09.04
    { id: 40, studentId: 2, title: 'Михаил Козлов', date: '2026-04-09', time: '09:00', duration: 45, status: 'scheduled', price: 1800 },
    { id: 41, studentId: 5, title: 'Ольга Новикова', date: '2026-04-09', time: '11:00', duration: 60, status: 'scheduled', price: 2000 },
    { id: 42, groupId: 2, title: 'Business English B1+', date: '2026-04-09', time: '17:00', duration: 90, status: 'scheduled', price: 0 },
    { id: 43, studentId: 8, title: 'Сергей Лебедев', date: '2026-04-09', time: '19:00', duration: 60, status: 'scheduled', price: 2000 },
    // Пятница 10.04
    { id: 50, studentId: 1, title: 'Анна Петрова', date: '2026-04-10', time: '10:00', duration: 60, status: 'scheduled', price: 2000 },
    { id: 51, studentId: 3, title: 'Елена Сидорова', date: '2026-04-10', time: '14:00', duration: 90, status: 'scheduled', price: 2500 },
    // Суббота 11.04
    { id: 60, groupId: 3, title: 'Разговорный клуб', date: '2026-04-11', time: '12:00', duration: 60, status: 'scheduled', price: 0 },
  ]

  const payments: Payment[] = [
    { id: 1, studentId: 1, studentName: 'Анна Петрова', amount: 8000, date: '2026-03-28', method: 'Перевод' },
    { id: 2, studentId: 5, studentName: 'Ольга Новикова', amount: 10000, date: '2026-03-25', method: 'Наличные' },
    { id: 3, studentId: 2, studentName: 'Михаил Козлов', amount: 7200, date: '2026-03-20', method: 'Перевод' },
    { id: 4, studentId: 3, studentName: 'Елена Сидорова', amount: 5000, date: '2026-03-15', method: 'Перевод' },
    { id: 5, studentId: 6, studentName: 'Алексей Морозов', amount: 4400, date: '2026-03-10', method: 'Наличные' },
    { id: 6, studentId: 8, studentName: 'Сергей Лебедев', amount: 6000, date: '2026-03-05', method: 'Перевод' },
    { id: 7, studentId: 1, studentName: 'Анна Петрова', amount: 8000, date: '2026-02-28', method: 'Перевод' },
    { id: 8, studentId: 4, studentName: 'Дмитрий Волков', amount: 3000, date: '2026-02-20', method: 'Перевод' },
    { id: 9, studentId: 6, studentName: 'Алексей Морозов', amount: 4400, date: '2026-02-10', method: 'Перевод' },
    { id: 10, studentId: 3, studentName: 'Елена Сидорова', amount: 10000, date: '2026-01-30', method: 'Наличные' },
  ]

  const workSchedule: WorkDay[] = [
    { day: 'Понедельник', short: 'Пн', enabled: true, intervals: [{ from: '09:00', to: '13:00' }, { from: '14:00', to: '19:00' }] },
    { day: 'Вторник', short: 'Вт', enabled: true, intervals: [{ from: '09:00', to: '12:00' }, { from: '17:00', to: '20:00' }] },
    { day: 'Среда', short: 'Ср', enabled: true, intervals: [{ from: '09:00', to: '13:00' }, { from: '14:00', to: '19:00' }] },
    { day: 'Четверг', short: 'Чт', enabled: true, intervals: [{ from: '09:00', to: '12:00' }, { from: '17:00', to: '20:00' }] },
    { day: 'Пятница', short: 'Пт', enabled: true, intervals: [{ from: '10:00', to: '16:00' }] },
    { day: 'Суббота', short: 'Сб', enabled: true, intervals: [{ from: '11:00', to: '14:00' }] },
    { day: 'Воскресенье', short: 'Вс', enabled: false, intervals: [] },
  ]

  function getStudent(id: number) {
    return students.find(s => s.id === id)
  }

  function getGroup(id: number) {
    return groups.find(g => g.id === id)
  }

  function getStudentLessons(studentId: number) {
    return weekLessons.filter(l => l.studentId === studentId)
  }

  function getStudentPayments(studentId: number) {
    return payments.filter(p => p.studentId === studentId)
  }

  function getLessonsByDate(date: string) {
    return weekLessons.filter(l => l.date === date)
  }

  function formatPrice(amount: number): string {
    return amount.toLocaleString('ru-RU') + ' \u20BD'
  }

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  function formatDateShort(dateStr: string): string {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
  }

  const totalDebt = students.reduce((sum, s) => sum + s.debt, 0)
  const activeStudentsCount = students.filter(s => s.status === 'active').length
  const monthPayments = payments.filter(p => p.date >= '2026-03-01' && p.date < '2026-04-01')
  const monthlyIncome = monthPayments.reduce((sum, p) => sum + p.amount, 0)
  const studentsWithDebt = students.filter(s => s.debt > 0)

  return {
    students,
    groups,
    todayLessons,
    weekLessons,
    payments,
    workSchedule,
    getStudent,
    getGroup,
    getStudentLessons,
    getStudentPayments,
    getLessonsByDate,
    formatPrice,
    formatDate,
    formatDateShort,
    totalDebt,
    activeStudentsCount,
    monthlyIncome,
    studentsWithDebt,
  }
}
