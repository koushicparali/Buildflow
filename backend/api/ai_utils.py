import os
from django.conf import settings
from .models import Invoice

try:
    import google.generativeai as genai
except ImportError:
    genai = None

def generate_task_invoice(task_id):
    """
    Generates an invoice using Gemini AI for a completed task.
    If no API key is found, generates a fallback mock invoice.
    """
    from .models import Task
    try:
        task = Task.objects.select_related('project').get(id=task_id)
    except Task.DoesNotExist:
        return
        
    api_key = os.environ.get("GEMINI_API_KEY")
    
    # Context about the task
    task_details = f"Task: {task.title}\nDescription: {task.description}\nBudget allocated: ₹{task.budget or 0}\nProject: {task.project.title}"
    
    if api_key and genai:
        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            prompt = f"""
            You are a professional billing system for a construction/engineering project.
            A task has just been completed. Generate a realistic itemized invoice in HTML format for the materials, labor, and services used to complete this task.
            The total amount should be exactly or very close to the allocated budget.
            
            Task Details:
            {task_details}
            
            Return ONLY valid HTML (a <table> is preferred). Do not include markdown codeblocks like ```html.
            """
            
            response = model.generate_content(prompt)
            content = response.text.replace("```html", "").replace("```", "").strip()
        except Exception as e:
            content = f"<div>Error generating AI invoice: {str(e)}</div>"
    else:
        # Mock invoice if no API key is present
        content = f"""
        <div style="font-family: sans-serif; color: #333;">
            <h3 style="color: #ff8c00; margin-bottom: 1rem;">Generated Invoice (Mock Mode)</h3>
            <p><strong>Task:</strong> {task.title}</p>
            <p><em>Note: No GEMINI_API_KEY found in environment. This is a mock generated invoice.</em></p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 1rem;">
                <tr style="border-bottom: 2px solid #ddd; text-align: left;">
                    <th style="padding: 8px;">Description</th>
                    <th style="padding: 8px;">Quantity</th>
                    <th style="padding: 8px;">Unit Price</th>
                    <th style="padding: 8px; text-align: right;">Total</th>
                </tr>
                <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 8px;">Labor (Engineering & Design)</td>
                    <td style="padding: 8px;">20 hrs</td>
                    <td style="padding: 8px;">&#8377;1,500</td>
                    <td style="padding: 8px; text-align: right;">&#8377;30,000</td>
                </tr>
                <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 8px;">Materials & Supplies</td>
                    <td style="padding: 8px;">1 Lot</td>
                    <td style="padding: 8px;">&#8377;{(task.budget or 40000) - 30000}</td>
                    <td style="padding: 8px; text-align: right;">&#8377;{(task.budget or 40000) - 30000}</td>
                </tr>
                <tr style="background: #f9f9f9; font-weight: bold;">
                    <td colspan="3" style="padding: 12px; text-align: right;">Grand Total:</td>
                    <td style="padding: 12px; text-align: right; color: #ff8c00;">&#8377;{task.budget or 40000}</td>
                </tr>
            </table>
        </div>
        """

    # Create or update the Invoice record
    invoice, created = Invoice.objects.update_or_create(
        task=task,
        defaults={
            'project': task.project,
            'content': content,
            'total_amount': task.budget or 0
        }
    )
    return invoice
