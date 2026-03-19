const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class JsonStore {
  constructor(filename) {
    this.filepath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(this.filepath)) {
      fs.writeFileSync(this.filepath, JSON.stringify([], null, 2));
    }
  }

  _read() {
    const data = fs.readFileSync(this.filepath, 'utf-8');
    return JSON.parse(data);
  }

  _write(data) {
    fs.writeFileSync(this.filepath, JSON.stringify(data, null, 2));
  }

  findAll(filter = {}) {
    let records = this._read();
    for (const [key, value] of Object.entries(filter)) {
      records = records.filter(r => r[key] === value);
    }
    return records;
  }

  findById(id) {
    const records = this._read();
    return records.find(r => r.id === id) || null;
  }

  findOne(filter = {}) {
    const records = this._read();
    return records.find(r => {
      return Object.entries(filter).every(([key, value]) => r[key] === value);
    }) || null;
  }

  create(record) {
    const records = this._read();
    records.push(record);
    this._write(records);
    return record;
  }

  updateById(id, updates) {
    const records = this._read();
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return null;
    records[index] = { ...records[index], ...updates };
    this._write(records);
    return records[index];
  }

  deleteById(id) {
    const records = this._read();
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return false;
    records.splice(index, 1);
    this._write(records);
    return true;
  }

  deleteMany(filter = {}) {
    let records = this._read();
    const before = records.length;
    records = records.filter(r => {
      return !Object.entries(filter).every(([key, value]) => r[key] === value);
    });
    this._write(records);
    return before - records.length;
  }
}

module.exports = JsonStore;
