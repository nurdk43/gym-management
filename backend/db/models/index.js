const User = require('./User');
const Package = require('./Package');
const Program = require('./Program');
const Enrollment = require('./Enrollment');
const Payment = require('./Payment');
const Attendance = require('./Attendance');
const ProgramMember = require('./ProgramMember');

// Program -> trainer
Program.belongsTo(User, { as: 'trainer', foreignKey: 'trainerId', targetKey: '_id' });

// Program -> enrolledMembers (Many-to-Many)
Program.belongsToMany(User, {
  through: ProgramMember,
  as: 'enrolledMembers',
  foreignKey: 'program',
  otherKey: 'member',
  targetKey: '_id'
});

// Enrollment ilişkileri
Enrollment.belongsTo(User, { as: 'user', foreignKey: 'userId', targetKey: '_id' });
Enrollment.belongsTo(Package, { as: 'package', foreignKey: 'packageId', targetKey: '_id' });

// Payment ilişkileri
Payment.belongsTo(User, { as: 'user', foreignKey: 'userId', targetKey: '_id' });
Payment.belongsTo(Enrollment, { as: 'enrollment', foreignKey: 'enrollmentId', targetKey: '_id' });

// Attendance ilişkileri
Attendance.belongsTo(User, { as: 'user', foreignKey: 'userId', targetKey: '_id' });
Attendance.belongsTo(User, { as: 'trainer', foreignKey: 'trainerId', targetKey: '_id' });

module.exports = {
  User,
  Package,
  Program,
  Enrollment,
  Payment,
  Attendance,
  ProgramMember
};

