const filterEnrolled = (students) => students.filter((stu) => {
  try {
    return stu.enrollment !== 'withdrawn';
  } catch (error) {}
});

module.exports = {
  filterEnrolled,
}
