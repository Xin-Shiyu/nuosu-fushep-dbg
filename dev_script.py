import unicodedata

def list_yi_radicals():
    # 彝文部首范围: U+A490 to U+A4C6
    start_code = 0xA490
    end_code = 0xA4C6
    
    print(f"{'字符':<5} {'Unicode':<10} {'字符名称 (Unicode Name)':<50}")
    print("-" * 70)
    
    for code in range(start_code, end_code + 1):
        char = chr(code)
        hex_code = f"U+{code:04X}"
        
        try:
            # 尝试获取官方 Unicode 名称
            name = unicodedata.name(char)
        except ValueError:
            # 如果标准库中没有该字符的名称（较少见，但可能在某些旧版本 Python 中发生）
            name = "<NO NAME>"
        name = name.split(' ')[-1].lower() + '='
        
        # 打印结果
        # 注意：某些终端可能无法正确显示彝文字符，可能会显示为方框或问号
        print(f"\"{char}\": \"{name}\",")

if __name__ == "__main__":
    list_yi_radicals()