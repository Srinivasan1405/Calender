const app = require('./app');
const { connectDB } = require('./app');

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB Connection Error:', err.message));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
