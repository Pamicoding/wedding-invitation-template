#!/usr/bin/env python3
"""
CSV to JSON 賓客名單轉換器
將CSV格式的賓客名單轉換成JSON格式

CSV格式要求：
- 必須包含欄位：name, ceremony
- name: 賓客姓名（字串）
- ceremony: 是否邀請參加證婚（布林值，可以是 true/false, 1/0, yes/no 等）
"""

import csv
import json
import sys
import os
from pathlib import Path


def parse_boolean(value):
    """
    將各種布林值表示轉換成Python boolean

    支援的true值：true, True, TRUE, 1, yes, Yes, YES, y, Y
    支援的false值：false, False, FALSE, 0, no, No, NO, n, N
    """
    if isinstance(value, bool):
        return value

    if isinstance(value, (int, float)):
        return bool(value)

    # 轉換成小寫字串進行比較
    value_str = str(value).strip().lower()

    # True的各種表示
    if value_str in ['true', '1', 'yes', 'y', 't']:
        return True

    # False的各種表示
    if value_str in ['false', '0', 'no', 'n', 'f', '']:
        return False

    # 如果無法識別，預設為False並警告
    print(f"⚠️  警告：無法識別的布林值 '{value}'，預設設為 False")
    return False


def convert_csv_to_json(csv_file_path, json_file_path=None):
    """
    將CSV檔案轉換成JSON格式

    參數：
        csv_file_path: CSV檔案路徑
        json_file_path: JSON輸出檔案路徑（可選，預設為 data/guests.json）
    """
    # 設定預設輸出路徑
    if json_file_path is None:
        json_file_path = Path(__file__).parent / 'data' / 'guests.json'

    # 檢查CSV檔案是否存在
    if not os.path.exists(csv_file_path):
        print(f"❌ 錯誤：找不到檔案 '{csv_file_path}'")
        sys.exit(1)

    guests = []

    try:
        # 讀取CSV檔案（支援UTF-8編碼）
        with open(csv_file_path, 'r', encoding='utf-8-sig') as csv_file:
            # 使用DictReader自動讀取標題行
            reader = csv.DictReader(csv_file)

            # 檢查必要的欄位
            required_fields = ['name', 'ceremony']
            if not all(field in reader.fieldnames for field in required_fields):
                print(f"❌ 錯誤：CSV檔案必須包含以下欄位：{', '.join(required_fields)}")
                print(f"   實際欄位：{', '.join(reader.fieldnames)}")
                sys.exit(1)

            # 轉換每一行
            row_number = 1
            for row in reader:
                row_number += 1

                # 取得姓名（去除前後空白）
                name = row['name'].strip()

                # 跳過空白行
                if not name:
                    print(f"⚠️  警告：第 {row_number} 行姓名為空，已跳過")
                    continue

                # 轉換ceremony欄位
                ceremony = parse_boolean(row['ceremony'])

                # 建立賓客物件
                guest = {
                    'name': name,
                    'ceremony': ceremony
                }

                guests.append(guest)

                # 顯示進度
                ceremony_text = '✓ 邀請證婚' if ceremony else '✗ 僅晚宴'
                print(f"  {len(guests):3d}. {name:20s} - {ceremony_text}")

        # 確保輸出目錄存在
        os.makedirs(os.path.dirname(json_file_path), exist_ok=True)

        # 寫入JSON檔案
        with open(json_file_path, 'w', encoding='utf-8') as json_file:
            json.dump(guests, json_file, ensure_ascii=False, indent=2)

        # 顯示成功訊息
        print(f"\n✅ 成功！")
        print(f"   共轉換 {len(guests)} 位賓客")
        print(f"   邀請參加證婚：{sum(1 for g in guests if g['ceremony'])} 位")
        print(f"   僅邀請晚宴：{sum(1 for g in guests if not g['ceremony'])} 位")
        print(f"   輸出檔案：{json_file_path}")

    except UnicodeDecodeError:
        print(f"❌ 錯誤：無法讀取檔案，請確認檔案編碼為 UTF-8")
        print(f"   提示：可以用Excel開啟CSV後，另存新檔時選擇 'UTF-8 CSV' 格式")
        sys.exit(1)

    except Exception as e:
        print(f"❌ 錯誤：{str(e)}")
        sys.exit(1)


def create_sample_csv(output_path='guests_sample.csv'):
    """
    建立範例CSV檔案供參考
    """
    sample_data = [
        {'name': '張三', 'ceremony': 'true'},
        {'name': '李四', 'ceremony': 'yes'},
        {'name': '王五', 'ceremony': '1'},
        {'name': '趙六', 'ceremony': 'false'},
        {'name': '錢七', 'ceremony': 'no'},
        {'name': '孫八', 'ceremony': '0'},
    ]

    with open(output_path, 'w', encoding='utf-8-sig', newline='') as csv_file:
        writer = csv.DictWriter(csv_file, fieldnames=['name', 'ceremony'])
        writer.writeheader()
        writer.writerows(sample_data)

    print(f"✅ 已建立範例CSV檔案：{output_path}")
    print(f"   你可以用這個檔案作為模板")


def main():
    """主程式"""
    print("=" * 60)
    print("🎉 婚禮賓客名單轉換器 (CSV → JSON)")
    print("=" * 60)
    print()

    # 解析命令列參數
    if len(sys.argv) < 2:
        print("使用方法：")
        print(f"  python {sys.argv[0]} <CSV檔案路徑> [JSON輸出路徑]")
        print()
        print("範例：")
        print(f"  python {sys.argv[0]} guests.csv")
        print(f"  python {sys.argv[0]} guests.csv data/guests.json")
        print()
        print("建立範例CSV檔案：")
        print(f"  python {sys.argv[0]} --sample")
        print()
        sys.exit(1)

    # 處理特殊指令
    if sys.argv[1] == '--sample':
        create_sample_csv()
        sys.exit(0)

    # 取得檔案路徑
    csv_path = sys.argv[1]
    json_path = sys.argv[2] if len(sys.argv) > 2 else None

    # 執行轉換
    convert_csv_to_json(csv_path, json_path)


if __name__ == '__main__':
    main()
