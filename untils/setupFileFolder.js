const fs = require("fs");
const path = require("path");

const folder = path.join(process.cwd(), "file");

module.exports = {
  setupFileFolder: function() {
    // Folder নেই কি চেক
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder);
      console.log("✅ 'file' folder created");
    }

    // প্রতি 3 মিনিটে সব file ডিলিট করবে
    setInterval(() => {
      // Folder আবার চেক করা
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
        console.log("✅ 'file' folder recreated");
        return;
      }

      fs.readdir(folder, (err, files) => {
        if (err) return console.error(err);

        files.forEach(file => {
          const filePath = path.join(folder, file);
          fs.unlink(filePath, err => {
            if (err) console.error(err);
          });
        });

        if (files.length > 0)
          console.log(`🗑 Cleared ${files.length} files from 'file' folder`);
      });
    }, 3 * 60 * 1000); // 3 minutes
  }
};



