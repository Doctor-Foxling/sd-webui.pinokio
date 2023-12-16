import subprocess
import re
import time

def run_webui(timeout=5):
    try:
        # Execute the webui.bat and capture the combined stdout and stderr
        process = subprocess.Popen("webui.bat", shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)

        # Read output from the subprocess with a timeout
        output = ""
        while True:
            line = ""
            start_time = time.time()
            while not line and time.time() - start_time < timeout:
                line = process.stdout.readline()
                if line:
                    output += line
                    print(line, end="")  # Print the output in real-time

            # Check if the process has ended
            if process.poll() is not None:
                break

        # Check for the "dubious ownership" error in the output
        if "dubious ownership" in output:
            # Extract the directory from the error message
            match = re.search(r"fatal: detected dubious ownership in repository at '(.+?)'", output)
            if match:
                git_dir = match.group(1)
                print(f"\nAdding {git_dir} to safe.directory in Git configuration.")
                # Add the directory to Git's safe.directory configuration
                subprocess.run(f"git config --global --add safe.directory \"{git_dir}\"", shell=True)

                # Rerun the webui.bat file
                print("Rerunning webui.bat...")
                run_webui()
            else:
                print("\nError message detected, but could not extract directory.")
        else:
            print("\nNo dubious ownership error detected.")
    except Exception as e:
        print(f"\nAn error occurred: {e}")

if __name__ == "__main__":
    run_webui()
