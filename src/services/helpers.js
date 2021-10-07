const filterEnrolled = (students) => students.filter((stu) => {
  try {
    return !['withdrawn', 'cancelled'].includes(stu.enrollment);
  } catch (error) {}
});

module.exports = {
  filterEnrolled,
}
