import sqlite3
import hashlib

conn = sqlite3.connect("userdata.db")
curr = conn.cursor()

curr.execute("""
CREATE TABLE IF NOT EXISTS userdata (
    id INTERGER PRIMARY KEY,
    username VARCHAR(25) NOT NULL,
    password VARCHAR(25) NOT NULL
)
""")

username1, password1 = "hrf", hashlib.sha256("tclailab".encode()).hexdigest()
username2, password2 = "xzm", hashlib.sha256("tclailab".encode()).hexdigest()
username3, password3 = "sxl", hashlib.sha256("tclailab".encode()).hexdigest()
username4, password4 = "william", hashlib.sha256("tclailab".encode()).hexdigest()
username5, password5 = "john", hashlib.sha256("tclailab".encode()).hexdigest()
username6, password6 = "wasif", hashlib.sha256("tclailab".encode()).hexdigest()

curr.execute("INSERT INTO userdata (username, password) VALUES (?, ?)", (username1,password1))
curr.execute("INSERT INTO userdata (username, password) VALUES (?, ?)", (username2,password2))
curr.execute("INSERT INTO userdata (username, password) VALUES (?, ?)", (username3,password3))
curr.execute("INSERT INTO userdata (username, password) VALUES (?, ?)", (username4,password4))
curr.execute("INSERT INTO userdata (username, password) VALUES (?, ?)", (username5,password5))
curr.execute("INSERT INTO userdata (username, password) VALUES (?, ?)", (username6,password6))

conn.commit()