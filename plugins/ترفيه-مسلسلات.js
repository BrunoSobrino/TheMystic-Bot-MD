let handler = async(m, {
	conn,
	text,
	command
}) => {
	let yh = global.loli
	let url = yh[Math.floor(Math.random() * yh.length)]
	conn.sendMessage(m.chat, {
		image: {
			url: url
		},
		caption: `اتفضل يحب شوف دا✨𝐌𝐀𝐃𝐀𝐑𝐀↳🐢↲𝐁𝐎𝐓`
	}, {
		quoted: m
	});
}
handler.command = /^(مسلسل)$/i
handler.tags = ['S H A D O W']
handler.help = ['صور مسلسلات عشوائيه']
export default handler

global.loli = [
"https://i.postimg.cc/jj1nqkwq/Screenshot-20220804-012127.jpg",
"https://i.postimg.cc/MHVQFbG6/Screenshot-20220804-012221.jpg",
"https://i.postimg.cc/Y0ksVjCF/Screenshot-20220804-012256.jpg",
"https://i.postimg.cc/3RQS4Wpq/Screenshot-20220804-012405.jpg",
"https://i.postimg.cc/HWq09jLW/Screenshot-20220804-012457.jpg",
"https://i.postimg.cc/ZqW0QFfG/Screenshot-20220804-012556.jpg",
"https://i.postimg.cc/yYC9S5fk/Screenshot-20220804-012647.jpg",
"https://i.postimg.cc/1tRFjQZt/Screenshot-20220804-012832.jpg",
"https://i.postimg.cc/yNy9jNtt/Screenshot-20220804-013653.jpg",
"https://i.postimg.cc/mkvtBxK7/Screenshot-20220804-013716.jpg",
"https://i.postimg.cc/KzXcHX3T/Screenshot-20220804-013736.jpg",
"https://i.postimg.cc/gcZ8jdHC/Screenshot-20220804-013809.jpg",
"https://i.postimg.cc/qRKPS9cP/Screenshot-20220804-014422.jpg",
"https://i.postimg.cc/Y0w5Hbbh/Screenshot-20220804-015541.jpg",
"https://i.postimg.cc/W1FvLWvw/Screenshot-20220804-030826.jpg",
"https://i.postimg.cc/LsxBtTJG/Screenshot-20220804-030856.jpg",
"https://i.postimg.cc/3NDsMzXM/Screenshot-20220804-031038.jpg",
"https://i.postimg.cc/4x5zG5Qn/Screenshot-20220804-031105.jpg",
"https://i.postimg.cc/SxWzQsSR/Screenshot-20220804-031143.jpg",
"https://i.postimg.cc/x8hb8NNJ/Screenshot-20220804-031220.jpg",
"https://i.postimg.cc/gjgWd1jN/Screenshot-20220804-031631.jpg",
"https://i.postimg.cc/HkZV3Pt0/Screenshot-20220804-031701.jpg",
"https://i.postimg.cc/9M2bXKH5/Screenshot-20220804-031810.jpg",
"https://i.postimg.cc/sxhYRCTR/Screenshot-20220804-031853.png",
"https://i.postimg.cc/Jz4sNWj4/Screenshot-20220804-031941.jpg",
"https://i.postimg.cc/fRkg1GD8/Screenshot-20220804-032405.jpg",
"https://i.postimg.cc/QM8VXJYY/Screenshot-20220804-032511.jpg",
"https://i.postimg.cc/3RH7ZgzC/Screenshot-20220804-032549.jpg",
"https://i.postimg.cc/VLzvwcGB/Screenshot-20220804-032628.jpg",
"https://i.postimg.cc/wTDXfHtX/Screenshot-20220804-032706.jpg",
"https://i.postimg.cc/nLy54380/Screenshot-20220804-032737.jpg",
"https://i.postimg.cc/T27VBp1X/Screenshot-20220804-032912.jpg",
"https://i.postimg.cc/j5N2xqYv/Screenshot-20220804-032937.jpg",
"https://i.postimg.cc/RZkzM7C5/Screenshot-20220804-033030.jpg",
"https://i.postimg.cc/k5RXsMG9/Screenshot-20220804-033332.jpg",
"https://i.postimg.cc/wxycNDgb/Screenshot-20220804-033416.jpg",
"https://i.postimg.cc/Fz7LhVzX/Screenshot-20220804-033452.jpg",
"https://i.postimg.cc/HsYN9JKD/Screenshot-20220804-033534.jpg",
"https://i.postimg.cc/QNfGBGNq/Screenshot-20220804-033810.jpg",
"https://i.postimg.cc/8c5hjVy3/Screenshot-20220804-122244.jpg",
"https://i.postimg.cc/zf8Hyrvj/Screenshot-20220804-122444.jpg",
"https://i.postimg.cc/8Cx8y1vd/Screenshot-20220804-122514.jpg",
"https://i.postimg.cc/fT5LTg14/Screenshot-20220804-122545.png",
"https://i.postimg.cc/kXLxXzW1/Screenshot-20220804-122550.png",
"https://i.postimg.cc/c1b3X2kx/Screenshot-20220804-122602.jpg",
"https://i.postimg.cc/Sx8cXdry/Screenshot-20220804-122656.jpg",
"https://i.postimg.cc/dVHcyRtx/Screenshot-20220804-123047.jpg",
"https://i.postimg.cc/KjkR6cpZ/Screenshot-20220804-123123.jpg",
"https://i.postimg.cc/x1YKB7HW/Screenshot-20220804-123231.jpg",
"https://i.postimg.cc/brcGkD9K/Screenshot-20220804-123311.jpg",
"https://i.postimg.cc/VLtJ46bg/Screenshot-20220804-134359.jpg",
"https://i.postimg.cc/Kzgk1rBP/Screenshot-20220804-134432.jpg",
"https://i.postimg.cc/905hfWFX/Screenshot-20220804-134547.jpg",
"https://i.postimg.cc/BnkJjWgz/Screenshot-20220804-134638.jpg",
"https://i.postimg.cc/761BgDnZ/Screenshot-20220804-134716.jpg",
"https://i.postimg.cc/BQmVYS98/Screenshot-20220804-134813.jpg",
"https://i.postimg.cc/430Gr6D9/Screenshot-20220804-134847.jpg",
"https://i.postimg.cc/vZBm1td4/Screenshot-20220804-134938.jpg",
"https://i.postimg.cc/tTL6kmpv/Screenshot-20220804-135544.jpg",
"https://i.postimg.cc/9QW7L9H2/Screenshot-20220804-135732.jpg",
"https://i.postimg.cc/Ls5ZpMs0/Screenshot-20220804-140237.jpg",
"https://i.postimg.cc/vTHJPXh9/Screenshot-20220804-140343.jpg",
"https://i.postimg.cc/NfNsw2rB/Screenshot-20220804-141115.jpg",
"https://i.postimg.cc/RCXd9gPy/Screenshot-20220804-141215.jpg",
"https://i.postimg.cc/0Ny7ywVn/Screenshot-20220804-141328.jpg",
"https://i.postimg.cc/wTkp6YKH/Screenshot-20220804-141409.jpg",
"https://i.postimg.cc/W1fx325R/Screenshot-20220804-141453.jpg",
"https://i.postimg.cc/mrsC79X7/Screenshot-20220804-141640.jpg",
"https://i.postimg.cc/j2XFrKDF/Screenshot-20220804-141705.jpg",
"https://i.postimg.cc/x1TS8pYm/Screenshot-20220804-141746.jpg",
   ];
