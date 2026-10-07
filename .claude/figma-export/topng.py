import sys, zlib, struct, math
src, dst = sys.argv[1], sys.argv[2]
data = open(src,'rb').read()
payload = struct.pack('>I', len(data)) + data
W = 512; rowbytes = W*3
H = math.ceil(len(payload)/rowbytes)
payload += b'\0'*(W*H*3-len(payload))
raw = b''.join(b'\0'+payload[i*rowbytes:(i+1)*rowbytes] for i in range(H))
def chunk(t, d): return struct.pack('>I',len(d))+t+d+struct.pack('>I', zlib.crc32(t+d)&0xffffffff)
png = b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR', struct.pack('>IIBBBBB', W,H,8,2,0,0,0))+chunk(b'IDAT', zlib.compress(raw,0))+chunk(b'IEND',b'')
open(dst,'wb').write(png); print(W,H,len(png))
